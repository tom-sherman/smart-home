import { BridgeDevice } from './bridge-types';
import { createSubscriptionHandler, parseBufferAsJson } from './util';
import { Dao } from './dao';
import { Device } from './generated/graphql';
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
          devices: bridgeDevices.map((bd) => ({
            description: bd.definition?.description,
            name: bd.friendly_name,
            powerSource: bd.power_source,
          })),
        }
      );

      if (registeredDevicesResponse.errors) {
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
