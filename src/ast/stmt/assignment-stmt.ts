import { ExpressionNode, SyntaxKind, SyntaxNode, SyntaxNodeFlags, TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { IdentifierExpression } from '../expr/identifier-expr';

/**
 * A variable assignment statement.
 */
export interface AssignmentStatement extends SyntaxNode {
  kind: SyntaxKind.AssignmentStatement;

  identifier: IdentifierExpression;
  value: ExpressionNode;
}

export function createAssignmentStatement(
  identifier: IdentifierExpression,
  value: ExpressionNode,
  location?: TextRange,
): AssignmentStatement {
  return setTextRange({
    kind: SyntaxKind.AssignmentStatement,
    identifier,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}
