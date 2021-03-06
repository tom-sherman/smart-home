import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X];
} &
  { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Device = {
  __typename?: 'Device';
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  id: Scalars['ID'];
  powerSource?: Maybe<Scalars['String']>;
  capabilities: Array<Maybe<Capability>>;
  controller: Scalars['String'];
};

export enum Access {
  Read = 'READ',
  Write = 'WRITE',
  Readwrite = 'READWRITE',
}

export type BinaryCapability = {
  __typename?: 'BinaryCapability';
  type: Scalars['String'];
  property: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  access: Access;
};

export type NumericCapability = {
  __typename?: 'NumericCapability';
  type: Scalars['String'];
  property: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  access: Access;
  min?: Maybe<Scalars['Float']>;
  max?: Maybe<Scalars['Float']>;
  unit?: Maybe<Scalars['String']>;
};

export type EnumCapability = {
  __typename?: 'EnumCapability';
  type: Scalars['String'];
  property: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  access: Access;
  values: Array<Maybe<Scalars['String']>>;
};

export type Capability = BinaryCapability | NumericCapability | EnumCapability;

export type CreateDeviceInputDevice = {
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  powerSource?: Maybe<Scalars['String']>;
  capabilities?: Maybe<Array<CapabilityInputObject>>;
};

export type CreateDeviceInput = {
  device: CreateDeviceInputDevice;
  controller: Scalars['String'];
};

export type CreateManyDevicesInput = {
  devices: Array<CreateDeviceInputDevice>;
  controller: Scalars['String'];
};

export type UnregisterDeviceInputDevice = {
  id: Scalars['ID'];
};

export type UnregisterManyDevicesInput = {
  devices: Array<UnregisterDeviceInputDevice>;
};

export type UnregisterManyDevicesResult = {
  __typename?: 'UnregisterManyDevicesResult';
  deletedDeviceIds: Array<Maybe<Scalars['String']>>;
};

/**
 * This is basically a workaround for GraphQL not having input unions. Ideally we would describe this type as
 * BinaryCapabilityInput | NumericCapabilityInput, instead we define an object with an optional key for each capability
 * type. This accomplishes the same thing as a union here because a device can have more than one capability, and more
 * than one capability of the same type.
 */
export type CapabilityInputObject = {
  binary?: Maybe<BinaryCapabilityInput>;
  numeric?: Maybe<NumericCapabilityInput>;
  enum?: Maybe<EnumCapabilityInput>;
};

export type BinaryCapabilityInput = {
  property: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  access: Access;
};

export type NumericCapabilityInput = {
  property: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  access: Access;
  min?: Maybe<Scalars['Float']>;
  max?: Maybe<Scalars['Float']>;
  unit?: Maybe<Scalars['String']>;
};

export type EnumCapabilityInput = {
  property: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  access: Access;
  values?: Maybe<Array<Scalars['String']>>;
};

export type UnregisterAllDevicesForControllerInput = {
  controller: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  allDevices: Array<Device>;
  devicesForController: Array<Device>;
};

export type QueryDevicesForControllerArgs = {
  controller: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Register a new device or re-register (override) an existing one */
  registerDevice?: Maybe<Device>;
  registerManyDevices?: Maybe<Array<Maybe<Device>>>;
  unregisterManyDevices?: Maybe<UnregisterManyDevicesResult>;
  unregisterAllDevicesForController?: Maybe<UnregisterManyDevicesResult>;
};

export type MutationRegisterDeviceArgs = {
  input: CreateDeviceInput;
};

export type MutationRegisterManyDevicesArgs = {
  input: CreateManyDevicesInput;
};

export type MutationUnregisterManyDevicesArgs = {
  input: UnregisterManyDevicesInput;
};

export type MutationUnregisterAllDevicesForControllerArgs = {
  input: UnregisterAllDevicesForControllerInput;
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> =
  | LegacyStitchingResolver<TResult, TParent, TContext, TArgs>
  | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Device: ResolverTypeWrapper<
    Omit<Device, 'capabilities'> & {
      capabilities: Array<Maybe<ResolversTypes['Capability']>>;
    }
  >;
  String: ResolverTypeWrapper<Scalars['String']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Access: Access;
  BinaryCapability: ResolverTypeWrapper<BinaryCapability>;
  NumericCapability: ResolverTypeWrapper<NumericCapability>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  EnumCapability: ResolverTypeWrapper<EnumCapability>;
  Capability:
    | ResolversTypes['BinaryCapability']
    | ResolversTypes['NumericCapability']
    | ResolversTypes['EnumCapability'];
  CreateDeviceInputDevice: CreateDeviceInputDevice;
  CreateDeviceInput: CreateDeviceInput;
  CreateManyDevicesInput: CreateManyDevicesInput;
  UnregisterDeviceInputDevice: UnregisterDeviceInputDevice;
  UnregisterManyDevicesInput: UnregisterManyDevicesInput;
  UnregisterManyDevicesResult: ResolverTypeWrapper<UnregisterManyDevicesResult>;
  CapabilityInputObject: CapabilityInputObject;
  BinaryCapabilityInput: BinaryCapabilityInput;
  NumericCapabilityInput: NumericCapabilityInput;
  EnumCapabilityInput: EnumCapabilityInput;
  UnregisterAllDevicesForControllerInput: UnregisterAllDevicesForControllerInput;
  Query: ResolverTypeWrapper<{}>;
  Mutation: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Device: Omit<Device, 'capabilities'> & {
    capabilities: Array<Maybe<ResolversParentTypes['Capability']>>;
  };
  String: Scalars['String'];
  ID: Scalars['ID'];
  BinaryCapability: BinaryCapability;
  NumericCapability: NumericCapability;
  Float: Scalars['Float'];
  EnumCapability: EnumCapability;
  Capability:
    | ResolversParentTypes['BinaryCapability']
    | ResolversParentTypes['NumericCapability']
    | ResolversParentTypes['EnumCapability'];
  CreateDeviceInputDevice: CreateDeviceInputDevice;
  CreateDeviceInput: CreateDeviceInput;
  CreateManyDevicesInput: CreateManyDevicesInput;
  UnregisterDeviceInputDevice: UnregisterDeviceInputDevice;
  UnregisterManyDevicesInput: UnregisterManyDevicesInput;
  UnregisterManyDevicesResult: UnregisterManyDevicesResult;
  CapabilityInputObject: CapabilityInputObject;
  BinaryCapabilityInput: BinaryCapabilityInput;
  NumericCapabilityInput: NumericCapabilityInput;
  EnumCapabilityInput: EnumCapabilityInput;
  UnregisterAllDevicesForControllerInput: UnregisterAllDevicesForControllerInput;
  Query: {};
  Mutation: {};
  Boolean: Scalars['Boolean'];
};

export type DeviceResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Device'] = ResolversParentTypes['Device']
> = {
  description?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  powerSource?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  capabilities?: Resolver<
    Array<Maybe<ResolversTypes['Capability']>>,
    ParentType,
    ContextType
  >;
  controller?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BinaryCapabilityResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['BinaryCapability'] = ResolversParentTypes['BinaryCapability']
> = {
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  property?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  access?: Resolver<ResolversTypes['Access'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NumericCapabilityResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['NumericCapability'] = ResolversParentTypes['NumericCapability']
> = {
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  property?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  access?: Resolver<ResolversTypes['Access'], ParentType, ContextType>;
  min?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  max?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EnumCapabilityResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['EnumCapability'] = ResolversParentTypes['EnumCapability']
> = {
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  property?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  access?: Resolver<ResolversTypes['Access'], ParentType, ContextType>;
  values?: Resolver<
    Array<Maybe<ResolversTypes['String']>>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CapabilityResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Capability'] = ResolversParentTypes['Capability']
> = {
  __resolveType: TypeResolveFn<
    'BinaryCapability' | 'NumericCapability' | 'EnumCapability',
    ParentType,
    ContextType
  >;
};

export type UnregisterManyDevicesResultResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['UnregisterManyDevicesResult'] = ResolversParentTypes['UnregisterManyDevicesResult']
> = {
  deletedDeviceIds?: Resolver<
    Array<Maybe<ResolversTypes['String']>>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
> = {
  allDevices?: Resolver<
    Array<ResolversTypes['Device']>,
    ParentType,
    ContextType
  >;
  devicesForController?: Resolver<
    Array<ResolversTypes['Device']>,
    ParentType,
    ContextType,
    RequireFields<QueryDevicesForControllerArgs, 'controller'>
  >;
};

export type MutationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']
> = {
  registerDevice?: Resolver<
    Maybe<ResolversTypes['Device']>,
    ParentType,
    ContextType,
    RequireFields<MutationRegisterDeviceArgs, 'input'>
  >;
  registerManyDevices?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Device']>>>,
    ParentType,
    ContextType,
    RequireFields<MutationRegisterManyDevicesArgs, 'input'>
  >;
  unregisterManyDevices?: Resolver<
    Maybe<ResolversTypes['UnregisterManyDevicesResult']>,
    ParentType,
    ContextType,
    RequireFields<MutationUnregisterManyDevicesArgs, 'input'>
  >;
  unregisterAllDevicesForController?: Resolver<
    Maybe<ResolversTypes['UnregisterManyDevicesResult']>,
    ParentType,
    ContextType,
    RequireFields<MutationUnregisterAllDevicesForControllerArgs, 'input'>
  >;
};

export type Resolvers<ContextType = any> = {
  Device?: DeviceResolvers<ContextType>;
  BinaryCapability?: BinaryCapabilityResolvers<ContextType>;
  NumericCapability?: NumericCapabilityResolvers<ContextType>;
  EnumCapability?: EnumCapabilityResolvers<ContextType>;
  Capability?: CapabilityResolvers<ContextType>;
  UnregisterManyDevicesResult?: UnregisterManyDevicesResultResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
};

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
