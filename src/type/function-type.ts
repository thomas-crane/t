import { Type } from '.';
import { ParameterSymbol } from '../symbol/function-symbol';
import { TypeInfo } from './type-info';
import { TypeKind } from './type-kind';

/**
 * The function type.
 */
export interface FunctionType extends TypeInfo {
  kind: TypeKind.Function;

  parameters: ParameterSymbol[];
  returnType: Type | undefined;
}

export function createFunctionType(
  name: string,
  parameters: ParameterSymbol[],
  returnType: Type | undefined,
): FunctionType {
  return {
    kind: TypeKind.Function,
    name,
    parameters,
    returnType,
  };
}
