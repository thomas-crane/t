import { NameExpression } from '../ast/expr/name-expr';
import { Symbol } from './symbol';
import { SymbolKind } from './symbol-kind';

/**
 * A symbol which refers to a variable.
 */
export interface VariableSymbol extends Symbol {
  kind: SymbolKind.Variable;
  isConst: boolean;
}

export function createVariableSymbol(
  name: NameExpression,
  isConst: boolean,
): VariableSymbol {
  return {
    kind: SymbolKind.Variable,
    isConst,
    name,
    references: [],
  };
}
