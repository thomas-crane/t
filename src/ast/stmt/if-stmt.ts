import { ExpressionNode, SyntaxKind, SyntaxNode, SyntaxNodeFlags, TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { BlockStatement } from './block-stmt';

/**
 * An if statement with an optional else branch.
 */
export interface IfStatement extends SyntaxNode {
  kind: SyntaxKind.IfStatement;

  condition: ExpressionNode;
  body: BlockStatement;
  elseBody: BlockStatement | undefined;
}

export function createIfStatement(
  condition: ExpressionNode,
  body: BlockStatement,
  elseBody?: BlockStatement,
  location?: TextRange,
): IfStatement {
  return setTextRange({
    kind: SyntaxKind.IfStatement,
    condition,
    body,
    elseBody,
    flags: SyntaxNodeFlags.None,
  }, location);
}