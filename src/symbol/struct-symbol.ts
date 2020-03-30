import { SyntaxNode } from '../ast/syntax-node';
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
  name: string,
  members: Record<string, StructMemberSymbol>,
  firstMention: SyntaxNode,
): StructSymbol {
  return {
    kind: SymbolKind.Struct,
    name,
    members,
    firstMention,
    references: [],
  };
}

export function createStructMemberSymbol(
  name: string,
  isConst: boolean,
  struct: StructSymbol,
  firstMention: SyntaxNode,
): StructMemberSymbol {
  return {
    kind: SymbolKind.StructMember,
    name,
    isConst,
    struct,
    firstMention,
    references: [],
  };
}
