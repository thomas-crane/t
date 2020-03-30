import { SyntaxKind, SyntaxNode, SyntaxNodeFlags, TextRange } from '../../types';
import { setTextRange } from '../../utils';

/**
 * A boolean literal expression.
 */
export interface BooleanExpression extends SyntaxNode {
  kind: SyntaxKind.Boolean;
  value: boolean;
}

export function createBooleanExpression(
  value: boolean,
  location?: TextRange,
): BooleanExpression {
  return setTextRange({
    kind: SyntaxKind.Boolean,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}