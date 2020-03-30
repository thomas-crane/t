import { ExpressionNode, SyntaxKind, SyntaxNode, SyntaxNodeFlags, TextRange } from '../../types';
import { setTextRange } from '../../utils';

/**
 * An expression which is wrapped in parentheses.
 */
export interface ParenExpression extends SyntaxNode {
  kind: SyntaxKind.ParenExpression;

  expr: ExpressionNode;
}

export function createParenExpression(
  expr: ExpressionNode,
  location?: TextRange,
): ParenExpression {
  return setTextRange({
    kind: SyntaxKind.ParenExpression,
    expr,
    flags: SyntaxNodeFlags.None,
  }, location);
}
