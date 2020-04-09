import { SyntaxNode } from '../ast/syntax-node';
import { Symbol } from './symbol';
import { SymbolKind } from './symbol-kind';

/**
 * A symbol which refers to a type.
 */
export interface TypeSymbol extends Symbol {
  kind: SymbolKind.Type;
}

export function createTypeSymbol(
  name: string,
  firstMention: SyntaxNode,
): TypeSymbol {
  return {
    kind: SymbolKind.Type,
    name,
    firstMention,
    references: [],
  };
}
