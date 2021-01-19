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
import { Capability, EnumCapability, NumericCapability } from '../sourceTypes';
import { Device, Access } from './schema';

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

export const CreateDeviceInputDevice = inputObjectType({
  name: 'CreateDeviceInputDevice',
  definition(t) {
    t.string('description');
    t.string('name');
    t.string('powerSource');
    t.field('capabilities', {
      type: list(nonNull(CapabilityInputObject)),
    });
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

const capabilityInputObjectKeyLookup = {
  binary: 'BinaryCapability',
  numeric: 'NumericCapability',
  enum: 'EnumCapability',
} as Record<string, Capability['__typename']>;

type CapabilityInput = Exclude<
  NexusGenInputs['CapabilityInputObject'][keyof NexusGenInputs['CapabilityInputObject']],
  null | undefined
>;

function mapInputCapability(
  type: string,
  inputCapability: CapabilityInput
): Capability {
  const typeName = capabilityInputObjectKeyLookup[type];

  if (!typeName) {
    throw new Error(`Unimplemented capability type "${type}"`);
  }

  const description = inputCapability.description ?? '';

  // TODO: Casting to eg NumericCapability is technically incorrect because that casts to the resolved/stored capability
  // type when we are actually working on the input type here. The input type can have a slightly different shape.
  switch (typeName) {
    case 'BinaryCapability': {
      return {
        __typename: typeName,
        ...inputCapability,
        description,
      };
    }

    case 'NumericCapability': {
      return {
        __typename: typeName,
        ...inputCapability,
        description,
        max: (inputCapability as NumericCapability).max ?? null,
        min: (inputCapability as NumericCapability).min ?? null,
        unit: (inputCapability as NumericCapability).unit ?? null,
      };
    }

    case 'EnumCapability': {
      return {
        __typename: typeName,
        ...inputCapability,
        description,
        values: (inputCapability as EnumCapability).values ?? [],
      };
    }
  }
}

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
      capabilities:
        device.capabilities?.flatMap((capability) => {
          const deviceCapabilities: Capability[] = [];

          for (const [type, inputCapability] of Object.entries(capability)) {
            if (!inputCapability) {
              continue;
            }

            deviceCapabilities.push(mapInputCapability(type, inputCapability));
          }

          return deviceCapabilities;
        }) ?? [],
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

// This is a workaround for graphql not having union input types.
export const CapabilityInputObject = inputObjectType({
  name: 'CapabilityInputObject',
  description: `
    This is basically a workaround for GraphQL not having input unions. Ideally we would describe this type as
    BinaryCapabilityInput | NumericCapabilityInput, instead we define an object with an optional key for each capability
    type. This accomplishes the same thing as a union here because a device can have more than one capability, and more
    than one capability of the same type.
  `,
  definition(t) {
    t.field('binary', {
      type: BinaryCapabilityInput,
    });
    t.field('numeric', {
      type: NumericCapabilityInput,
    });
    t.field('enum', {
      type: EnumCapabilityInput,
    });
  },
});

export const BinaryCapabilityInput = inputObjectType({
  name: 'BinaryCapabilityInput',
  definition(t) {
    t.nonNull.string('property');
    t.string('description');
    t.nonNull.field('access', {
      type: Access,
    });
  },
});

export const NumericCapabilityInput = inputObjectType({
  name: 'NumericCapabilityInput',
  definition(t) {
    t.nonNull.string('property');
    t.string('description');
    t.nonNull.field('access', {
      type: Access,
    });
    t.float('min');
    t.float('max');
    t.string('unit');
  },
});

export const EnumCapabilityInput = inputObjectType({
  name: 'EnumCapabilityInput',
  definition(t) {
    t.nonNull.string('property');
    t.string('description');
    t.nonNull.field('access', {
      type: Access,
    });
    t.list.nonNull.string('values');
  },
});
