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

export type NonLightCapability = Exclude<Capability, { type: 'light' }>;

export type Capability =
  | {
      // For some reason some lights have a light capability that has multiple capabilities nested within?? Weird!
      type: 'light';
      access: number;
      features: NonLightCapability[];
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
