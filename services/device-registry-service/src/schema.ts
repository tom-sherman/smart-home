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
      resolve: (_source, _args, context) => context.store.values(),
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
  },
});

export const createDevice = mutationField('registerDevice', {
  type: Device,
  description:
    'Register a new device or re-register (override) an existing one',
  args: {
    input: arg({
      type: nonNull(CreateDeviceInput),
    }),
  },
  resolve: async (_source, { input: { device } }, context) => {
    const id = uuid();
    const resolvedDevice = {
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
    await context.store.set(id, resolvedDevice);
    return resolvedDevice;
  },
});
