import {
  BridgeDevice,
  Capability,
  isFeatureCapability,
  NonFeatureCapability,
  SupportedBridgeDevice,
} from './bridge-types';
import { createSubscriptionHandler, parseBufferAsJson } from './util';
import { Dao } from './dao';
import { Access, CapabilityInputObject, Device } from './generated/graphql';
import { fetchGql } from './fetch-graphql';

export interface Dependencies {
  rootTopic: string;
  dao: Dao;
  deviceRegistryEndpoint: string;
  controllerName: string;
}

export function createHandlers({
  rootTopic,
  dao,
  deviceRegistryEndpoint,
  controllerName,
}: Dependencies) {
  const bridgeDeviceHandler = createSubscriptionHandler(
    `${rootTopic}/bridge/devices`,
    async function bridgeDeviceHandler(payload) {
      const currentLocalDevices = await dao.getAllDevices();
      console.log(`${currentLocalDevices.length} devices stored locally.`);

      const bridgeDevices = parseBufferAsJson<BridgeDevice[]>(payload);

      // Supported devices in the payload which are not currently stored locally
      // ie. New devices
      const devicesToRegister = bridgeDevices.filter(
        (bridgeDevice): bridgeDevice is SupportedBridgeDevice =>
          bridgeDevice.supported &&
          currentLocalDevices.every(
            (localDevice) =>
              localDevice.bridgeDevice.ieee_address !==
              bridgeDevice.ieee_address
          )
      );

      // Devices which are stored locally but not in the payload
      // We need to unregister them as they've been removed from the network
      const devicesToUnregister = currentLocalDevices
        .filter((localDevice) =>
          bridgeDevices.every(
            (bridgeDevice) =>
              bridgeDevice.ieee_address !==
              localDevice.bridgeDevice.ieee_address
          )
        )
        .map(({ id }) => ({ id }));

      console.log(`Registering ${devicesToRegister.length} devices`);
      console.log(`Unregistering ${devicesToUnregister.length} devices`);

      const [
        registeredDevicesResponse,
        unregisterAllDevicesResponse,
      ] = await Promise.all([
        fetchGql<RegisterDevicesResponse>(
          deviceRegistryEndpoint,
          registerDevicesQuery,
          {
            controller: controllerName,
            devices: devicesToRegister.map((bd) => ({
              description: bd.definition.description,
              name: bd.friendly_name,
              powerSource: bd.power_source,
              capabilities: bd.definition.exposes.flatMap((capability) =>
                isFeatureCapability(capability)
                  ? capability.features.map((lightCap) =>
                      mapCapability(lightCap)
                    )
                  : [mapCapability(capability)]
              ),
            })),
          }
        ),
        fetchGql<UnregisterManyDevicesResponse>(
          deviceRegistryEndpoint,
          unregisterManyDevicesQuery,
          { devices: devicesToUnregister }
        ),
      ]);

      if (registeredDevicesResponse.errors) {
        console.log(registeredDevicesResponse.errors);
        throw new Error('Failed to store devices');
      }

      if (unregisterAllDevicesResponse.errors) {
        console.log(unregisterAllDevicesResponse.errors);
        throw new Error('Failed to unregister devices.');
      }

      console.log(
        `Storing ${registeredDevicesResponse.data.registerManyDevices.length} new devices`
      );
      console.log(
        `Deleting ${unregisterAllDevicesResponse.data.unregisterManyDevices.deletedDeviceIds.length} devices`
      );

      await Promise.all([
        // // We're relying on the API returning us the registered devices in the order we sent them
        dao.storeDevices(
          registeredDevicesResponse.data.registerManyDevices.map(
            (device, index) => ({
              id: device.id,
              bridgeDevice: devicesToRegister[index],
            })
          )
        ),
        dao.removeDevices(
          unregisterAllDevicesResponse.data.unregisterManyDevices
            .deletedDeviceIds
        ),
      ]);
    }
  );

  return [bridgeDeviceHandler];
}

const accessLookup = {
  1: Access.Read,
  2: Access.Write,
  7: Access.Readwrite,
};
function mapAccess(access: number): Access {
  const resolvedAccess = accessLookup[access as keyof typeof accessLookup] as
    | Access
    | undefined;

  if (!resolvedAccess) {
    throw new Error(
      `Access of with value ${access} not implemnted in DeviceRegistry schema.`
    );
  }

  return resolvedAccess;
}

function mapCapability(
  capability: NonFeatureCapability
): CapabilityInputObject {
  const access = mapAccess(capability.access);

  // !!! IMPORTANT !!!
  // The following return statements avoid using ...spread syntax on purpose.
  // If we used them then we may end up sending extra properties which is a type error in graphql 🙄
  switch (capability.type) {
    case 'binary':
      return {
        binary: {
          access,
          property: capability.property,
          description: capability.description,
        },
      };

    case 'numeric':
      return {
        numeric: {
          access,
          property: capability.property,
          description: capability.description,
          max: capability.value_max,
          min: capability.value_min,
          unit: capability.unit,
        },
      };

    case 'enum':
      return {
        enum: {
          access,
          property: capability.property,
          description: capability.description,
          values: capability.values,
        },
      };
  }
}

interface UnregisterManyDevicesResponse {
  unregisterManyDevices: {
    deletedDeviceIds: string[];
  };
}

const unregisterManyDevicesQuery = `
  mutation UnregisterManyZigbeeDevices($devices: [UnregisterDeviceInputDevice!]!) {
    unregisterManyDevices(input: {  devices: $devices }) {
      deletedDeviceIds
    }
  }
`;

interface RegisterDevicesResponse {
  registerManyDevices: Pick<Device, 'id'>[];
}

const registerDevicesQuery = `
  mutation RegisterZigbeeDevices(
    $devices: [CreateDeviceInputDevice!]!
    $controller: String!
  ) {
    registerManyDevices(input: { devices: $devices, controller: $controller }) {
      id
    }
  }
`;
