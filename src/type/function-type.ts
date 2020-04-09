import { Type } from '.';
import { TypeInfo } from './type-info';
import { TypeKind } from './type-kind';

/**
 * The function type.
 */
export interface FnType extends TypeInfo {
  kind: TypeKind.Fn;

  parameters: Type[];
  returnType: Type | undefined;
}

export function createFnType(
  name: string,
  parameters: Type[],
  returnType: Type | undefined,
): FnType {
  return {
    kind: TypeKind.Fn,
    name,
    parameters,
    returnType,
    fields: {},
  };
}
