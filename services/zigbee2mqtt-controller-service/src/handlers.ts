import {
  BridgeDevice,
  Capability,
  NonLightCapability,
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
    async function bridgeDeviceHandler(buf) {
      // Unregister all of our devices from the registry.
      const unregisterAllDevicesResponse = await fetchGql<UnregisterAllDevicesResponse>(
        deviceRegistryEndpoint,
        unregisterAllDevicesQuery,
        { controller: controllerName }
      );

      if (unregisterAllDevicesResponse.errors) {
        throw new Error('Failed to unregister devices.');
      }

      const bridgeDevices = parseBufferAsJson<BridgeDevice[]>(buf);

      // Register devices in the registry
      const registeredDevicesResponse = await fetchGql<RegisterDevicesResponse>(
        deviceRegistryEndpoint,
        registerDevicesQuery,
        {
          controller: controllerName,
          devices: bridgeDevices
            .filter((bd): bd is SupportedBridgeDevice => bd.supported)
            .map((bd) => ({
              description: bd.definition.description,
              name: bd.friendly_name,
              powerSource: bd.power_source,
              capabilities: bd.definition.exposes.flatMap((capability) =>
                capability.type === 'light'
                  ? capability.features.map((lightCap) =>
                      mapCapability(lightCap)
                    )
                  : [mapCapability(capability)]
              ),
            })),
        }
      );

      if (registeredDevicesResponse.errors) {
        console.log(registeredDevicesResponse.errors);
        throw new Error('Failed to store devices');
      }

      // We're relying on the API returning us the registered devices in the order we sent them
      const records = Object.fromEntries(
        registeredDevicesResponse.data.registerManyDevices.map(
          (device, index) => [
            device.id,
            {
              bridgeDevice: bridgeDevices[index],
            },
          ]
        )
      );
      await dao.storeDevices(records);
      console.log(
        `Done registering ${registeredDevicesResponse.data.registerManyDevices.length} devices`
      );
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

function mapCapability(capability: NonLightCapability): CapabilityInputObject {
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

interface UnregisterAllDevicesResponse {
  deletedDeviceIds: string[];
}

const unregisterAllDevicesQuery = `
  mutation UnregisterZigbeeDevices($controller: String!) {
    unregisterAllDevicesForController(input: { controller: $controller }) {
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
