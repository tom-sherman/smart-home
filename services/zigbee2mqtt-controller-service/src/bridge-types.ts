export interface BridgeDeviceProperties {
  ieee_address: string;
  friendly_name: string;
  power_source: string;
  interview_completed: boolean;
  interviewing: boolean;
}

export type BridgeDevice = BridgeDeviceProperties &
  (
    | {
        supported: false;
        definition: null;
      }
    | {
        supported: true;
        definition: {
          description: string;
          exposes: Capability[];
        };
      }
  );

export type SupportedBridgeDevice = Extract<BridgeDevice, { supported: true }>;

export const specificCapabilityTypes = ['light', 'switch'] as const;

export type SpecificCapabilityType = typeof specificCapabilityTypes[number];

export function isSpecificCapability(
  capability: Capability
): capability is SpecificCapability {
  return specificCapabilityTypes.some((type) => type === capability.type);
}

export type SpecificCapability = {
  type: SpecificCapabilityType;
  features: GenericCapability[];
};

export type GenericCapability =
  | {
      type: 'numeric';
      property: string;
      name: string;
      access: number;
      value_max: number;
      value_min: number;
      unit: string;
      description: string;
    }
  | {
      type: 'binary';
      description: string;
      access: number;
      property: string;
      name: string;
      value_on: 'string';
      value_off: 'string';
      value_toggle: string;
    }
  | {
      type: 'enum';
      description: string;
      access: number;
      property: string;
      name: string;
      values: string[];
    }
  | {
      type: 'text';
      name: string;
      property: string;
      access: number;
    }
  | {
      type: 'composite';
      name: string;
      property: string;
      features: GenericCapability;
    };

export type Capability = SpecificCapability | GenericCapability;
