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

export type SupportedBridgeDevice = BridgeDevice & { supported: true };

export type NonFeatureCapability = Exclude<
  Capability,
  { type: FeatureCapabilityType }
>;

export const featureCapabilityTypes = ['light', 'switch'] as const;

export type FeatureCapabilityType = typeof featureCapabilityTypes[number];

export function isFeatureCapability(
  capability: Capability
): capability is Extract<Capability, { type: FeatureCapabilityType }> {
  return featureCapabilityTypes.some((type) => type === capability.type);
}

export type Capability =
  | {
      // For some reason there is a capability that has multiple capabilities nested within?? Weird!
      type: FeatureCapabilityType;
      access: number;
      features: NonFeatureCapability[];
    }
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
    };
