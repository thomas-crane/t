import { Type } from '.';
import { TypeInfo } from './type-info';
import { TypeKind } from './type-kind';

export interface OptionalType extends TypeInfo {
  kind: TypeKind.Optional;

  valueType: Type;
}

export function createOptionalType(
  valueType: Type,
): OptionalType {
  return {
    kind: TypeKind.Optional,
    name: `${valueType.name}?`,
    valueType,
    fields: {},
  };
}
