import {
  enumType,
  unionType,
  nonNull,
  objectType,
  list,
  queryType,
  mutationField,
  arg,
  inputObjectType,
} from 'nexus';
import { v4 as uuid } from 'uuid';
import { NexusGenInputs, NexusGenRootTypes } from './generated/nexus-typegen';

export const Device = objectType({
  name: 'Device',
  definition(t) {
    t.string('description');
    t.nonNull.string('name');
    t.nonNull.id('id');
    t.string('powerSource');
    t.field('exposes', {
      type: nonNull(Expose),
    });
    t.nonNull.string('controller');
  },
});

export const Expose = objectType({
  name: 'Expost',
  definition(t) {
    t.nonNull.string('type');
    t.field('capabilities', {
      type: nonNull(list(Capability)),
    });
  },
});

export const Access = enumType({
  name: 'Access',
  members: ['READ', 'WRITE', 'READWRITE'],
});

export const BinaryCapability = objectType({
  name: 'BinaryCapability',
  definition(t) {
    t.nonNull.string('type', {
      resolve: () => 'binary',
    });
    t.nonNull.string('property', {
      resolve: (source) => source.property,
    });
    t.string('description');
    t.nonNull.field('access', {
      type: Access,
      resolve: (source) => source.access,
    });
  },
});
export const NumericCapability = objectType({
  name: 'NumericCapability',
  definition(t) {
    t.nonNull.string('type', {
      resolve: () => 'numeric',
    });
    t.nonNull.string('property', {
      resolve: (source) => source.property,
    });
    t.string('description');
    t.nonNull.field('access', {
      type: Access,
      resolve: (source) => source.access,
    });
    t.float('min');
    t.float('max');
    t.string('unit');
  },
});

export const Capability = unionType({
  name: 'Capability',
  definition(t) {
    t.members('BinaryCapability', 'NumericCapability');
  },
  resolveType: (source) => source.__typename,
});

export const Query = queryType({
  definition(t) {
    t.nonNull.list.field('allDevices', {
      type: nonNull(Device),
      resolve: (_source, _args, context) => context.store.getAllDevices(),
    });
  },
});

export const CreateDeviceInputDevice = inputObjectType({
  name: 'CreateDeviceInputDevice',
  definition(t) {
    t.string('description');
    t.string('name');
    t.string('powerSource');
  },
});

export const CreateDeviceInput = inputObjectType({
  name: 'CreateDeviceInput',
  definition(t) {
    t.nonNull.field('device', {
      type: CreateDeviceInputDevice,
    });
    t.nonNull.string('controller');
  },
});

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
  type: Device,
  description:
    'Register a new device or re-register (override) an existing one',
  args: {
    input: arg({
      type: nonNull(CreateDeviceInput),
    }),
  },
  resolve: async (_source, { input: { device, controller } }, context) => {
    const resolvedDevice = { ...mapInputDevice(device), controller };
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
