import { ExpressionNode, SyntaxKind, SyntaxNode, SyntaxNodeFlags, TextRange } from '../../types';
import { setTextRange } from '../../utils';

/**
 * An expression statement.
 */
export interface ExpressionStatement extends SyntaxNode {
  kind: SyntaxKind.ExpressionStatement;

  expr: ExpressionNode;
}

export function createExpressionStatement(
  expr: ExpressionNode,
  location?: TextRange,
): ExpressionStatement {
  return setTextRange({
    kind: SyntaxKind.ExpressionStatement,
    expr,
    flags: SyntaxNodeFlags.None,
  }, location);
}
