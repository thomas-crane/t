import { ExpressionNode, SyntaxKind, SyntaxNode, SyntaxNodeFlags, TextRange } from '../../types';
import { setTextRange } from '../../utils';

/**
 * A return statement.
 */
export interface ReturnStatement extends SyntaxNode {
  kind: SyntaxKind.ReturnStatement;

  value: ExpressionNode;
}

export function createReturnStatement(
  value: ExpressionNode,
  location?: TextRange,
): ReturnStatement {
  return setTextRange({
    kind: SyntaxKind.ReturnStatement,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}
