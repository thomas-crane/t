import { ArrayType } from './array-type';
import { BooleanType } from './boolean-type';
import { FunctionType } from './function-type';
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
  | FunctionType
  | ArrayType
  | StructType
  | OptionalType
  | NilType
  ;
