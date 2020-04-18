import { NameExpression } from '../ast/expr/name-expr';
import { Symbol } from './symbol';
import { SymbolKind } from './symbol-kind';

/**
 * A symbol which refers to a function.
 */
export interface FnSymbol extends Symbol {
  kind: SymbolKind.Function;
  parameters: ParameterSymbol[];
}

/**
 * A symbol which refers to the parameter of a function.
 */
export interface ParameterSymbol extends Symbol {
  kind: SymbolKind.Parameter;
}

export function createFnSymbol(
  name: NameExpression,
  parameters: ParameterSymbol[],
): FnSymbol {
  return {
    kind: SymbolKind.Function,
    parameters,
    name,
    references: [],
  };
}

export function createParameterSymbol(
  name: NameExpression,
): ParameterSymbol {
  return {
    kind: SymbolKind.Parameter,
    name,
    references: [],
  };
}
