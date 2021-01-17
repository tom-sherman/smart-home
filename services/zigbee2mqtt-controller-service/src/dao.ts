import { Store } from 'store';
import { BridgeDevice } from './bridge-types';
import { Device } from './generated/graphql';

interface DeviceRecord {
  bridgeDevice: BridgeDevice;
}

export class Dao {
  constructor(private store: Store<DeviceRecord>) {}

  async storeDevices(devices: Record<string, DeviceRecord>): Promise<void> {
    await this.store.batch(
      Object.entries(devices).map(([uuid, record]) => ({
        type: 'set',
        key: uuid,
        value: record,
      }))
    );
  }

  async getDevice(uuid: string): Promise<DeviceRecord | null> {
    return this.store.get(uuid);
  }

  async getAllDevices(): Promise<DeviceRecord[]> {
    return this.store.values();
  }
}
