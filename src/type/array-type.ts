import { Type } from '.';
import { TypeInfo } from './type-info';
import { TypeKind } from './type-kind';

/**
 * The array type.
 */
export interface ArrayType extends TypeInfo {
  kind: TypeKind.Array;

  itemType: Type;
}

export function createArrayType(
  itemType: Type,
): ArrayType {
  return {
    kind: TypeKind.Array,
    name: `${itemType.name}[]`,
    itemType,
  };
}
