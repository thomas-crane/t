import { NameExpression } from '../ast/expr/name-expr';
import { SymbolKind } from './symbol-kind';

/**
 * The base type of all types which represent some kind of symbol.
 */
export interface Symbol {
  kind: SymbolKind;
  /**
   * The name expression node at which this symbol was declared.
   */
  name: NameExpression;
  /**
   * Other name expressions which are referring to this node.
   */
  references: NameExpression[];
}
