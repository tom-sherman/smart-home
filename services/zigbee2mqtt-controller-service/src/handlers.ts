import { BridgeDevice } from './bridge-types';
import { createSubscriptionHandler, parseBufferAsJson } from './util';
import fetch from 'node-fetch';
import { Dao } from './dao';
import { Device } from './generated/graphql';

export interface Dependencies {
  rootTopic: string;
  dao: Dao;
}

export function createHandlers({ rootTopic, dao }: Dependencies) {
  const bridgeDeviceHandler = createSubscriptionHandler(
    `${rootTopic}/bridge/devices`,
    async function bridgeDeviceHandler(buf) {
      const currentLocalDevices = await dao.getAllDevices();
      // Unregister all of our devices from the registry.
      const deletedDeviceIds = await unregisterAllDevices();

      const bridgeDevices = parseBufferAsJson<BridgeDevice[]>(buf);
      // Register devices in the registry
      const registeredDevices = await registerDevices(bridgeDevices);

      // We're relying on the API returning us the registered devices in the order we sent them
      const records = Object.fromEntries(
        registeredDevices.map((device, index) => [
          device.id,
          {
            device,
            bridgeDevice: bridgeDevices[index],
          },
        ])
      );
      await dao.storeDevices(records);
    }
  );

  return [bridgeDeviceHandler];
}

function registerDevices(bridgeDevices: BridgeDevice[]): Promise<Device[]> {
  throw new Error('Function not implemented.');
}
function unregisterAllDevices() {
  throw new Error('Function not implemented.');
}
