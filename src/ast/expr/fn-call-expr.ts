import { ExpressionNode } from '.';
import { Binder } from '../../bind/binder';
import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

export const enum FnCallFlags {
  None = 0,

  FieldAccess = 1 << 1,

  Operator = 1 << 2,
  BinaryOp = 1 << 3,
  UnaryOp = 1 << 4,

  Index = 1 << 5,
}

/**
 * A function call expression.
 */
export interface FnCallExpression extends SyntaxNode {
  kind: SyntaxKind.FnCallExpression;

  fn: ExpressionNode;
  args: ExpressionNode[];
  fnFlags: FnCallFlags;
}

export function createFnCallExpression(
  fn: ExpressionNode,
  args: ExpressionNode[],
  fnFlags: FnCallFlags = FnCallFlags.None,
  location?: TextRange,
): FnCallExpression {
  return setTextRange({
    kind: SyntaxKind.FnCallExpression,
    fn,
    args,
    flags: SyntaxNodeFlags.None,
    fnFlags,
  }, location);
}

export function printFnCallExpression(printer: Printer, node: FnCallExpression) {
  if (node.fnFlags & FnCallFlags.FieldAccess) {
    printFieldAccess(printer, node);
    return;
  }
  if (node.fnFlags & FnCallFlags.BinaryOp) {
    printBinaryOp(printer, node);
    return;
  }
  if (node.fnFlags & FnCallFlags.UnaryOp) {
    printUnaryOp(printer, node);
    return;
  }
  if (node.fnFlags & FnCallFlags.Index) {
    printIndex(printer, node);
  }
  printer.indent('(FnCallExpression');
  printer.printNode(node.fn);
  node.args.forEach((arg) => printer.printNode(arg));
  printer.dedent(')');
}

function printFieldAccess(printer: Printer, node: FnCallExpression) {
  printer.indent('(FieldAccess');
  printer.printNode(node.fn);
  printer.printNode(node.args[0]);
  printer.dedent(')');
}

function printBinaryOp(printer: Printer, node: FnCallExpression) {
  printer.indent('(BinaryExpression');
  printer.printNode(node.args[0]);
  printer.printNode(node.fn);
  printer.printNode(node.args[1]);
  printer.dedent(')');
}

function printUnaryOp(printer: Printer, node: FnCallExpression) {
  printer.indent('(UnaryOp');
  printer.printNode(node.fn);
  printer.printNode(node.args[0]);
  printer.dedent(')');
}

function printIndex(printer: Printer, node: FnCallExpression) {
  printer.indent('(IndexExpression');
  printer.printNode(node.fn);
  printer.printNode(node.args[0]);
  printer.dedent(')');
}

export function bindFnCallExpression(binder: Binder, node: FnCallExpression) {
  binder.bindNode(node.fn);
  if (node.fnFlags & FnCallFlags.FieldAccess) {
    // since we don't know the type of the target yet, we can't determine whether
    // or the member being accessed is actually part of that type. The name
    // may refer to something on the type, so wait until later to check args.
    return;
  }
  node.args.forEach((arg) => binder.bindNode(arg));
}
