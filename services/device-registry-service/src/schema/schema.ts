import {
  enumType,
  unionType,
  nonNull,
  objectType,
  list,
  queryType,
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
export const EnumCapability = objectType({
  name: 'EnumCapability',
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
    t.nonNull.list.string('values');
  },
});
export const Capability = unionType({
  name: 'Capability',
  definition(t) {
    t.members(BinaryCapability, NumericCapability, EnumCapability);
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
