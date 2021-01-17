export interface Device {
  description: string | null;
  name: string;
  id: string;
  controller: string;
  // TODO: Enum?
  powerSource: string | null;
  capabilities: Capability[];
}

export enum Access {
  Read = 'READ',
  Write = 'WRITE',
  ReadWrite = 'READWRITE',
}

export interface BaseCapability {
  property: string;
  description: string;
  access: Access;
}

export interface BinaryCapability extends BaseCapability {
  __typename: 'BinaryCapability';
}

export interface NumericCapability extends BaseCapability {
  __typename: 'NumericCapability';
  max: number;
  min: number;
  // TODO: enum?
  unit?: string;
}

export interface EnumCapability extends BaseCapability {
  __typename: 'EnumCapability';
  values: string[];
}

export type Capability = BinaryCapability | NumericCapability;
