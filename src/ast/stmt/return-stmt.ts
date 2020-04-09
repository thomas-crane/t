import { Binder } from '../../bind/binder';
import { Printer } from '../../printer';
import { TypeChecker } from '../../typecheck/typechecker';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { ExpressionNode } from '../expr';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

/**
 * A return statement.
 */
export interface ReturnStatement extends SyntaxNode {
  kind: SyntaxKind.ReturnStatement;

  value: ExpressionNode;
}

export function createReturnStatement(
  value: ExpressionNode,
  location?: TextRange,
): ReturnStatement {
  return setTextRange({
    kind: SyntaxKind.ReturnStatement,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printReturnStatement(printer: Printer, node: ReturnStatement) {
  printer.indent('(ReturnStatement');
  printer.printNode(node.value);
  printer.dedent(')');
}

export function bindReturnStatement(binder: Binder, node: ReturnStatement) {
  binder.bindNode(node.value);
}

export function checkReturnStatement(checker: TypeChecker, node: ReturnStatement) {
  checker.checkNode(node.value);
}
