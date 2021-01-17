import { Store } from 'store';
import { Device } from './sourceTypes';

export class DeviceStore {
  constructor(private store: Store<Device>) {}

  async getAllDevices(): Promise<Device[]> {
    return this.store.values();
  }

  async getAllDevicesForController(constroller: string): Promise<Device[]> {
    const allDevices = await this.getAllDevices();

    return allDevices.filter((device) => device.controller === constroller);
  }

  createOrUpdateDevices(
    devices: { id: string; device: Device }[]
  ): Promise<void> {
    return this.store.batch(
      devices.map(({ id, device }) => ({
        type: 'set',
        key: id,
        value: device,
      }))
    );
  }

  removeDevices(deviceIds: string[]): Promise<void> {
    return this.store.batch(
      deviceIds.map((id) => ({
        type: 'delete',
        key: id,
      }))
    );
  }
}
