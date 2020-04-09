import { SyntaxNode } from '../ast/syntax-node';
import { SymbolKind } from './symbol-kind';

/**
 * The base type of all types which represent some kind of symbol.
 */
export interface Symbol {
  kind: SymbolKind;
  name: string;
  firstMention: SyntaxNode;
  references: SyntaxNode[];
}
