import { ExpressionNode } from '.';
import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

export interface IndexExpression extends SyntaxNode {
  kind: SyntaxKind.IndexExpression;

  target: ExpressionNode;
  index: ExpressionNode;
}

export function createIndexExpression(
  target: ExpressionNode,
  index: ExpressionNode,
  location?: TextRange,
): IndexExpression {
  return setTextRange({
    kind: SyntaxKind.IndexExpression,
    target,
    index,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printIndexExpression(printer: Printer, node: IndexExpression) {
  printer.indent('(IndexExpression');
  printer.printNode(node.target);
  printer.printNode(node.index);
  printer.dedent(')');
}
