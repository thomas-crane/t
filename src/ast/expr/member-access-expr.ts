import { ExpressionNode, SyntaxKind, SyntaxNode, SyntaxNodeFlags, TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { IdentifierExpression } from './identifier-expr';

export interface MemberAccessExpression extends SyntaxNode {
  kind: SyntaxKind.MemberAccessExpression;

  target: ExpressionNode;
  member: IdentifierExpression;
}

export function createMemberAccessExpression(
  target: ExpressionNode,
  member: IdentifierExpression,
  location?: TextRange,
): MemberAccessExpression {
  return setTextRange({
    kind: SyntaxKind.MemberAccessExpression,
    target,
    member,
    flags: SyntaxNodeFlags.None,
  }, location);
}
