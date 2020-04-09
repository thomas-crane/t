import { createIdentifierExpression, IdentifierExpression } from '../ast/expr/identifier-expr';
import { SyntaxNodeFlags } from '../ast/syntax-node';
import { createLinkedTable, LinkedTable } from '../common/linked-table';
import { createScopedMap, ScopedMap } from '../common/scoped-map';
import { SymbolType } from '../symbol';
import { createTypeSymbol, TypeSymbol } from '../symbol/type-symbol';
import { createVariableSymbol } from '../symbol/variable-symbol';

function createSyntheticIdentifier(name: string): IdentifierExpression {
  const identifier = createIdentifierExpression(name);
  identifier.flags |= SyntaxNodeFlags.Synthetic;
  return identifier;
}

export function createGlobalTypeTable(): ScopedMap<string, SymbolType> {
  const numNode = createSyntheticIdentifier('num');
  const numSymbol = createTypeSymbol(numNode.value, numNode);
  numNode.symbol = numSymbol;

  const boolNode = createSyntheticIdentifier('bool');
  const boolSymbol = createTypeSymbol(numNode.value, numNode);
  boolNode.symbol = boolSymbol;

  const strNode = createSyntheticIdentifier('str');
  const strSymbol = createTypeSymbol(strNode.value, strNode);
  strNode.symbol = strSymbol;

  const nilNode = createSyntheticIdentifier('nil');
  const nilSymbol = createTypeSymbol(nilNode.value, nilNode);
  nilNode.symbol = nilSymbol;

  const table = createScopedMap<string, TypeSymbol>();
  table.set(numSymbol.name, numSymbol);
  table.set(boolSymbol.name, boolSymbol);
  table.set(strSymbol.name, strSymbol);
  table.set(nilSymbol.name, nilSymbol);

  return table;
}

function createGlobalValueTable(): LinkedTable<string, SymbolType> {
  const nilNode = createSyntheticIdentifier('nil');
  const nilSymbol = createVariableSymbol(nilNode.value, true, nilNode);

  const table = createLinkedTable<string, SymbolType>();
  table.set(nilSymbol.name, nilSymbol);

  return table;
}

export const globalValueTable = createGlobalValueTable();
