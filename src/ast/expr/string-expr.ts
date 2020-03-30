import { SyntaxKind, SyntaxNode, SyntaxNodeFlags, TextRange } from '../../types';
import { setTextRange } from '../../utils';

export interface StringExpression extends SyntaxNode {
  kind: SyntaxKind.String;
  value: string;
}

export function createStringExpression(
  value: string,
  location?: TextRange,
): StringExpression {
  return setTextRange({
    kind: SyntaxKind.String,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}
