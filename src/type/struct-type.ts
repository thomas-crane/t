import { Type } from '.';
import { TypeInfo } from './type-info';
import { TypeKind } from './type-kind';

export interface StructType extends TypeInfo {
  kind: TypeKind.Struct;

  members: Record<string, Type | undefined>;
}

export function createStructType(
  name: string,
  members: Record<string, Type | undefined>,
): StructType {
  return {
    kind: TypeKind.Struct,
    name,
    members,
    fields: {},
  };
}
