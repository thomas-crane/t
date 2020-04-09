import { SyntaxNode } from '../ast/syntax-node';
import { Symbol } from './symbol';
import { SymbolKind } from './symbol-kind';

/**
 * A symbol which refers to a function.
 */
export interface FunctionSymbol extends Symbol {
  kind: SymbolKind.Function;
  parameters: ParameterSymbol[];
}

/**
 * A symbol which refers to the parameter of a function.
 */
export interface ParameterSymbol extends Symbol {
  kind: SymbolKind.Parameter;
}

export function createFunctionSymbol(
  name: string,
  parameters: ParameterSymbol[],
  firstMention: SyntaxNode,
): FunctionSymbol {
  return {
    kind: SymbolKind.Function,
    name,
    parameters,
    firstMention,
    references: [],
  };
}

export function createParameterSymbol(
  name: string,
  firstMention: SyntaxNode,
): ParameterSymbol {
  return {
    kind: SymbolKind.Parameter,
    name,
    firstMention,
    references: [],
  };
}
