import { ExpressionNode } from '.';
import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

/**
 * An expression which is wrapped in parentheses.
 */
export interface ParenExpression extends SyntaxNode {
  kind: SyntaxKind.ParenExpression;

  expr: ExpressionNode;
}

export function createParenExpression(
  expr: ExpressionNode,
  location?: TextRange,
): ParenExpression {
  return setTextRange({
    kind: SyntaxKind.ParenExpression,
    expr,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printParenExpression(printer: Printer, node: ParenExpression) {
  printer.indent('(ParenExpression');
  printer.printNode(node.expr);
  printer.dedent(')');
}
