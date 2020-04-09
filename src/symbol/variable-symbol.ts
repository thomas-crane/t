import { SyntaxNode } from '../ast/syntax-node';
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
  name: string,
  isConst: boolean,
  firstMention: SyntaxNode,
): VariableSymbol {
  return {
    kind: SymbolKind.Variable,
    name,
    isConst,
    firstMention,
    references: [],
  };
}
