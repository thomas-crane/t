import { TypeInfo } from './type-info';
import { TypeKind } from './type-kind';

/**
 * The number type.
 */
export interface NumberType extends TypeInfo {
  kind: TypeKind.Number;
}

export function createNumberType(): NumberType {
  return {
    kind: TypeKind.Number,
    name: 'num',
  };
}
