import {
  arg,
  inputObjectType,
  list,
  mutationField,
  nonNull,
  objectType,
} from 'nexus';
import { v4 as uuid } from 'uuid';
import { NexusGenInputs } from '../generated/nexus-typegen';
import { Device, CreateDeviceInput, CreateDeviceInputDevice } from './schema';

function mapInputDevice(device: NexusGenInputs['CreateDeviceInputDevice']) {
  const id = uuid();
  return {
    ...device,
    id,
    description: device.description ?? null,
    name: device.name ?? id,
    powerSource: device.powerSource ?? null,
    exposes: {
      type: 'unknown',
      capabilities: [],
    },
  };
}

export const createDevice = mutationField('registerDevice', {
  type: 'Device',
  description:
    'Register a new device or re-register (override) an existing one',
  args: {
    input: arg({
      type: nonNull(CreateDeviceInput),
    }),
  },
  resolve: async (_source, { input: { device, controller } }, context) => {
    const resolvedDevice = {
      ...mapInputDevice(device),
      controller,
      capabilities: [],
    };
    await context.store.createOrUpdateDevices([
      {
        id: resolvedDevice.id,
        device: resolvedDevice,
      },
    ]);
    return resolvedDevice;
  },
});

export const CreateManyDevicesInput = inputObjectType({
  name: 'CreateManyDevicesInput',
  definition(t) {
    t.nonNull.field('devices', {
      type: list(nonNull(CreateDeviceInputDevice)),
    });
    t.nonNull.string('controller');
  },
});

export const registerManyDevices = mutationField('registerManyDevices', {
  type: list(Device),
  args: {
    input: arg({
      type: nonNull(CreateManyDevicesInput),
    }),
  },
  resolve: async (_source, { input: { devices, controller } }, context) => {
    const resolvedDevices = devices.map((device) => ({
      ...mapInputDevice(device),
      controller,
      capabilities: [],
    }));

    await context.store.createOrUpdateDevices(
      resolvedDevices.map((device) => ({
        id: device.id,
        device,
      }))
    );

    return resolvedDevices;
  },
});

export const UnregisterDeviceInputDevice = inputObjectType({
  name: 'UnregisterDeviceInputDevice',
  definition(t) {
    t.nonNull.id('id');
  },
});

export const UnregisterManyDevicesInput = inputObjectType({
  name: 'UnregisterManyDevicesInput',
  definition(t) {
    t.nonNull.field('devices', {
      type: list(nonNull(UnregisterDeviceInputDevice)),
    });
  },
});

export const UnregisterManyDevicesResult = objectType({
  name: 'UnregisterManyDevicesResult',
  definition(t) {
    t.nonNull.list.string('deletedDeviceIds');
  },
});

export const unregisterManyDevices = mutationField('unregisterManyDevices', {
  type: UnregisterManyDevicesResult,
  args: {
    input: arg({
      type: nonNull(UnregisterManyDevicesInput),
    }),
  },
  resolve: async (_source, { input: { devices } }, context) => {
    const ids = devices.map((device) => device.id);
    await context.store.removeDevices(ids);
    return {
      deletedDeviceIds: ids,
    };
  },
});

const UnregisterAllDevicesForControllerInput = inputObjectType({
  name: 'UnregisterAllDevicesForControllerInput',
  definition(t) {
    t.nonNull.string('controller');
  },
});

export const unregisterAllDevicesForController = mutationField(
  'unregisterAllDevicesForController',
  {
    type: UnregisterManyDevicesResult,
    args: {
      input: arg({
        type: nonNull(UnregisterAllDevicesForControllerInput),
      }),
    },
    resolve: async (_source, { input: { controller } }, context) => {
      const devices = await context.store.getAllDevicesForController(
        controller
      );
      const ids = devices.map((device) => device.id);
      await context.store.removeDevices(ids);

      return {
        deletedDeviceIds: ids,
      };
    },
  }
);
