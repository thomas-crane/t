import { TypeNode } from '.';
import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

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

export function printArrayTypeNode(printer: Printer, node: ArrayTypeNode) {
  printer.indent('(ArrayType');
  printer.printNode(node.itemType);
  printer.dedent(')');
}
