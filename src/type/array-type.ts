import { Type } from '.';
import { createFnType } from './function-type';
import { createOptionalType } from './optional-type';
import { TypeInfo } from './type-info';
import { TypeKind } from './type-kind';

export const indexFnName = '[]';

/**
 * The array type.
 */
export interface ArrayType extends TypeInfo {
  kind: TypeKind.Array;

  itemType: Type;
}

export function createArrayType(
  itemType: Type,
  indexType: Type,
): ArrayType {
  return {
    kind: TypeKind.Array,
    name: `${itemType.name}[]`,
    itemType,
    fields: {
      // add an index function.
      [indexFnName]: createFnType(
        indexFnName,
        [indexType],
        // the return type is an optional version of the item type.
        createOptionalType(itemType),
      ),
    },
  };
}
