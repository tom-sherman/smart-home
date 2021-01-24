import { Store } from 'store';
import { BridgeDevice } from './bridge-types';
import { Device } from './generated/graphql';

interface DeviceRecord {
  bridgeDevice: BridgeDevice;
  id: string;
}

export class Dao {
  constructor(private store: Store<DeviceRecord>) {}

  async storeDevices(devices: DeviceRecord[]): Promise<void> {
    await this.store.batch(
      devices.map((record) => ({
        type: 'set',
        key: record.id,
        value: record,
      }))
    );
  }

  async removeDevices(deviceIds: string[]): Promise<void> {
    await this.store.batch(
      deviceIds.map((id) => ({
        type: 'delete',
        key: id,
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
