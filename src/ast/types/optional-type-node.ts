import { TypeNode } from '.';
import { Binder } from '../../bind/binder';
import { Printer } from '../../printer';
import { createOptionalType } from '../../type/optional-type';
import { TypeChecker } from '../../typecheck/typechecker';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

export interface OptionalTypeNode extends SyntaxNode {
  kind: SyntaxKind.OptionalType;

  valueType: TypeNode;
}

export function createOptionalTypeNode(
  valueType: TypeNode,
  location?: TextRange,
): OptionalTypeNode {
  return setTextRange({
    kind: SyntaxKind.OptionalType,
    valueType,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printOptionalTypeNode(printer: Printer, node: OptionalTypeNode) {
  printer.indent('(OptionalTypeNode');
  printer.printNode(node.valueType);
  printer.dedent(')');
}

export function bindOptionalTypeNode(binder: Binder, node: OptionalTypeNode) {
  binder.bindNode(node.valueType);
}

export function checkOptionalTypeNode(checker: TypeChecker, node: OptionalTypeNode) {
  checker.checkNode(node.valueType);
  if (node.valueType.type === undefined) {
    return;
  }
  node.type = createOptionalType(node.valueType.type);
}
