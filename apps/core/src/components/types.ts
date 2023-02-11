import { UiPropertiesLeaf } from '../core/form';

export type IComponentProps<Value> = UiPropertiesLeaf<Value> & {
  value?: Value;
  defaultValue?: Value;
  onChange: (value: Value) => void;
  name: string;
  errorMessage?: string;
  isRequired?: boolean;
};
