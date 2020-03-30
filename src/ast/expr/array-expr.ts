import { ExpressionNode, SyntaxKind, SyntaxNode, SyntaxNodeFlags, TextRange } from '../../types';
import { setTextRange } from '../../utils';

/**
 * A list of expressions surrounded by square brackets.
 */
export interface ArrayExpression extends SyntaxNode {
  kind: SyntaxKind.ArrayExpression;

  items: ExpressionNode[];
}

export function createArrayExpression(
  items: ExpressionNode[],
  location?: TextRange,
): ArrayExpression {
  return setTextRange({
    kind: SyntaxKind.ArrayExpression,
    items,
    flags: SyntaxNodeFlags.None,
  }, location);
}
