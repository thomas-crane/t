import { ExpressionNode, SyntaxKind, SyntaxNode, SyntaxNodeFlags, TextRange, TypeNode } from '../../types';
import { setTextRange } from '../../utils';
import { IdentifierExpression } from '../expr/identifier-expr';

/**
 * A variable declaration statement. This encompasses
 * both mutable and immutable assignments.
 */
export interface DeclarationStatement extends SyntaxNode {
  kind: SyntaxKind.DeclarationStatement;

  isConst: boolean;
  identifier: IdentifierExpression;
  typeNode?: TypeNode;
  value: ExpressionNode;
}

export function createDeclarationStatement(
  isConst: boolean,
  identifier: IdentifierExpression,
  typeNode: TypeNode | undefined,
  value: ExpressionNode,
  location?: TextRange,
): DeclarationStatement {
  return setTextRange({
    kind: SyntaxKind.DeclarationStatement,
    isConst,
    identifier,
    typeNode,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}
