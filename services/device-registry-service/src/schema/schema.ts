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

export const Device = objectType({
  name: 'Device',
  definition(t) {
    t.string('description');
    t.nonNull.string('name');
    t.nonNull.id('id');
    t.string('powerSource');
    t.field('capabilities', {
      type: nonNull(list(Capability)),
    });
    t.nonNull.string('controller');
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
