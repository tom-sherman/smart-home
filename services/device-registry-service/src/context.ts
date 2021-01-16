import { Device } from './sourceTypes';
import { Store } from './store';

export interface ContextType {
  store: Store<Device>;
}
