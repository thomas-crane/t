import { TypeNode } from '.';
import { Binder } from '../../bind/binder';
import { Printer } from '../../printer';
import { createArrayType } from '../../type/array-type';
import { TypeChecker } from '../../typecheck/typechecker';
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

export function bindArrayTypeNode(binder: Binder, node: ArrayTypeNode) {
  binder.bindNode(node.itemType);
}

export function checkArrayTypeNode(checker: TypeChecker, node: ArrayTypeNode) {
  checker.checkNode(node.itemType);
  if (node.itemType.type === undefined) {
    return;
  }
  const numType = checker.typeTable.get('num');
  if (numType === undefined) {
    return;
  }
  node.type = createArrayType(node.itemType.type, numType);
}
