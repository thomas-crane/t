import { ExpressionNode, SyntaxKind, SyntaxNode, SyntaxNodeFlags, TextRange } from '../../types';
import { setTextRange } from '../../utils';

/**
 * A function call expression.
 */
export interface FnCallExpression extends SyntaxNode {
  kind: SyntaxKind.FnCallExpression;

  fn: ExpressionNode;
  args: ExpressionNode[];
}

export function createFnCallExpression(
  fn: ExpressionNode,
  args: ExpressionNode[],
  location?: TextRange,
): FnCallExpression {
  return setTextRange({
    kind: SyntaxKind.FnCallExpression,
    fn,
    args,
    flags: SyntaxNodeFlags.None,
  }, location);
}
