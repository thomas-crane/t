import { SyntaxKind, SyntaxNode, SyntaxNodeFlags, TextRange } from '../../types';
import { setTextRange } from '../../utils';

/**
 * An identifier literal expression.
 */
export interface IdentifierExpression extends SyntaxNode {
  kind: SyntaxKind.Identifier;
  value: string;
}

export function createIdentifierExpression(
  value: string,
  location?: TextRange,
): IdentifierExpression {
  return setTextRange({
    kind: SyntaxKind.Identifier,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}
