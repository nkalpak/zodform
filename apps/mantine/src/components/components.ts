import { StringMantine } from './string-mantine';
import { EnumMantine } from './enum-mantine';
import { NumberMantine } from './number-mantine';
import { BooleanMantine } from './boolean-mantine';
import { ObjectMantine } from './object-mantine';
import { MultiChoiceMantine } from './multi-choice-mantine';
import { ArrayMantine } from './array-mantine';

export const components = {
  string: StringMantine,
  enum: EnumMantine,
  number: NumberMantine,
  boolean: BooleanMantine,
  object: ObjectMantine,
  multiChoice: MultiChoiceMantine,
  array: ArrayMantine
} as const;
