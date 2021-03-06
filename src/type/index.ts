import { ArrayType } from './array-type';
import { BooleanType } from './boolean-type';
import { FnType } from './function-type';
import { NilType } from './nil-type';
import { NumberType } from './number-type';
import { OptionalType } from './optional-type';
import { StringType } from './string-type';
import { StructType } from './struct-type';

/**
 * The set of all types.
 */
export type Type
  = NumberType
  | BooleanType
  | StringType
  | FnType
  | ArrayType
  | StructType
  | OptionalType
  | NilType
  ;
