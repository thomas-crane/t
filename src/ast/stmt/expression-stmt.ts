import { Binder } from '../../bind/binder';
import { Printer } from '../../printer';
import { TypeChecker } from '../../typecheck/typechecker';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { ExpressionNode } from '../expr';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

/**
 * An expression statement.
 */
export interface ExpressionStatement extends SyntaxNode {
  kind: SyntaxKind.ExpressionStatement;

  expr: ExpressionNode;
}

export function createExpressionStatement(
  expr: ExpressionNode,
  location?: TextRange,
): ExpressionStatement {
  return setTextRange({
    kind: SyntaxKind.ExpressionStatement,
    expr,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printExpressionStatement(printer: Printer, node: ExpressionStatement) {
  printer.indent('(ExpressionStatement');
  printer.printNode(node.expr);
  printer.dedent(')');
}

export function bindExpressionStatement(binder: Binder, node: ExpressionStatement) {
  binder.bindNode(node.expr);
}

export function checkExpressionStatement(checker: TypeChecker, node: ExpressionStatement) {
  checker.checkNode(node.expr);
}
