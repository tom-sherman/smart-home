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

export type Capability =
  | {
      type: 'light';
      access: number;
      features: Exclude<Capability, { type: 'light' }>[];
    }
  | {
      type: 'numeric';
      property: string;
      name: string;
      access: number;
      value_max: number;
      value_min: number;
      unit: string;
    }
  | {
      type: 'binary';
      property: string;
      name: string;
      value_on: 'string';
      value_off: 'string';
      value_toggle: string;
    }
  | {
      type: 'enum';
      property: string;
      name: string;
      values: string[];
    };
