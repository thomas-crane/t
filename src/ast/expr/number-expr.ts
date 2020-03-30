import { SyntaxKind, SyntaxNode, SyntaxNodeFlags, TextRange } from '../../types';
import { setTextRange } from '../../utils';

/**
 * A number literal expression.
 */
export interface NumberExpression extends SyntaxNode {
  kind: SyntaxKind.Number;
  value: number;
}

export function createNumberExpression(
  value: number,
  location?: TextRange,
): NumberExpression {
  return setTextRange({
    kind: SyntaxKind.Number,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}