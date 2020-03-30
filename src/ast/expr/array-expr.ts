import { ExpressionNode } from '.';
import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

/**
 * A list of expressions surrounded by square brackets.
 */
export interface ArrayExpression extends SyntaxNode {
  kind: SyntaxKind.ArrayExpression;

  items: ExpressionNode[];
}

export function createArrayExpression(
  items: ExpressionNode[],
  location?: TextRange,
): ArrayExpression {
  return setTextRange({
    kind: SyntaxKind.ArrayExpression,
    items,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printArrayExpression(printer: Printer, node: ArrayExpression) {
  printer.indent('(ArrayExpression');
  node.items.forEach((item) => printer.printNode(item));
  printer.dedent(')');
}
