import { ExpressionNode } from '.';
import { Binder } from '../../bind/binder';
import { Printer } from '../../printer';
import { TypeChecker } from '../../typecheck/typechecker';
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

export function bindParenExpression(binder: Binder, node: ParenExpression) {
  binder.bindNode(node.expr);
}

export function checkParenExpression(checker: TypeChecker, node: ParenExpression) {
  checker.checkNode(node.expr);
  // bubble the type upwards so that
  // stuff like `1 + (2)` is still valid.
  node.type = node.expr.type;
}
