import { SyntaxKind, SyntaxNode, SyntaxNodeFlags, TextRange, TypeNode } from '../../types';
import { setTextRange } from '../../utils';

export interface OptionalTypeNode extends SyntaxNode {
  kind: SyntaxKind.OptionalType;

  valueType: TypeNode;
}

export function createOptionalType(
  valueType: TypeNode,
  location?: TextRange,
): OptionalTypeNode {
  return setTextRange({
    kind: SyntaxKind.OptionalType,
    valueType,
    flags: SyntaxNodeFlags.None,
  }, location);
}
