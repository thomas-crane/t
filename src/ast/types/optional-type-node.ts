import { TypeNode } from '.';
import { Printer } from '../../printer';
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
