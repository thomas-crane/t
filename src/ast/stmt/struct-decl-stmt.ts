import { SyntaxKind, SyntaxNode, SyntaxNodeFlags, TextRange, TypeNode } from '../../types';
import { setTextRange } from '../../utils';
import { IdentifierExpression } from '../expr/identifier-expr';

export interface StructDeclStatement extends SyntaxNode {
  kind: SyntaxKind.StructDeclStatement;

  name: IdentifierExpression;
  members: Record<string, StructMember>;
}

export interface StructMember extends SyntaxNode {
  kind: SyntaxKind.StructMember;

  isConst: boolean;
  name: IdentifierExpression;
  typeNode?: TypeNode;
}

export function createStructDeclStatement(
  name: IdentifierExpression,
  members: StructDeclStatement['members'],
  location?: TextRange,
): StructDeclStatement {
  return setTextRange({
    kind: SyntaxKind.StructDeclStatement,
    name,
    members,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createStructMember(
  isConst: boolean,
  name: IdentifierExpression,
  typeNode: TypeNode | undefined,
  location?: TextRange,
): StructMember {
  return setTextRange({
    kind: SyntaxKind.StructMember,
    isConst,
    name,
    typeNode,
    flags: SyntaxNodeFlags.None,
  }, location);
}
