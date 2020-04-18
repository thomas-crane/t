import { NameExpression } from '../ast/expr/name-expr';
import { Symbol } from './symbol';
import { SymbolKind } from './symbol-kind';

export interface StructSymbol extends Symbol {
  kind: SymbolKind.Struct;

  members: Record<string, StructMemberSymbol>;
}

export interface StructMemberSymbol extends Symbol {
  kind: SymbolKind.StructMember;

  isConst: boolean;
  struct: StructSymbol;
}

export function createStructSymbol(
  name: NameExpression,
  members: Record<string, StructMemberSymbol>,
): StructSymbol {
  return {
    kind: SymbolKind.Struct,
    members,
    name,
    references: [],
  };
}

export function createStructMemberSymbol(
  name: NameExpression,
  isConst: boolean,
  struct: StructSymbol,
): StructMemberSymbol {
  return {
    kind: SymbolKind.StructMember,
    isConst,
    struct,
    name,
    references: [],
  };
}
