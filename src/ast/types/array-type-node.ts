import { SyntaxKind, SyntaxNode, SyntaxNodeFlags, TextRange, TypeNode } from '../../types';
import { setTextRange } from '../../utils';

/**
 * An array type node.
 */
export interface ArrayTypeNode extends SyntaxNode {
  kind: SyntaxKind.ArrayType;

  itemType: TypeNode;
}

export function createArrayTypeNode(
  itemType: TypeNode,
  location?: TextRange,
): ArrayTypeNode {
  return setTextRange({
    kind: SyntaxKind.ArrayType,
    itemType,
    flags: SyntaxNodeFlags.None,
  }, location);
}
