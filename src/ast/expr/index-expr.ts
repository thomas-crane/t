import { ExpressionNode, SyntaxKind, SyntaxNode, SyntaxNodeFlags, TextRange } from '../../types';
import { setTextRange } from '../../utils';

export interface IndexExpression extends SyntaxNode {
  kind: SyntaxKind.IndexExpression;

  target: ExpressionNode;
  index: ExpressionNode;
}

export function createIndexExpression(
  target: ExpressionNode,
  index: ExpressionNode,
  location?: TextRange,
): IndexExpression {
  return setTextRange({
    kind: SyntaxKind.IndexExpression,
    target,
    index,
    flags: SyntaxNodeFlags.None,
  }, location);
}
