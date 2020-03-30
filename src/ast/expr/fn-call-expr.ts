import { ExpressionNode } from '.';
import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

/**
 * A function call expression.
 */
export interface FnCallExpression extends SyntaxNode {
  kind: SyntaxKind.FnCallExpression;

  fn: ExpressionNode;
  args: ExpressionNode[];
}

export function createFnCallExpression(
  fn: ExpressionNode,
  args: ExpressionNode[],
  location?: TextRange,
): FnCallExpression {
  return setTextRange({
    kind: SyntaxKind.FnCallExpression,
    fn,
    args,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printFnCallExpression(printer: Printer, node: FnCallExpression) {
  printer.indent('(FnCallExpression');
  printer.printNode(node.fn);
  node.args.forEach((arg) => printer.printNode(arg));
  printer.dedent(')');
}
