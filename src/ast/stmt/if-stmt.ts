import { Binder } from '../../bind/binder';
import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { ExpressionNode } from '../expr';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';
import { BlockStatement } from './block-stmt';

/**
 * An if statement with an optional else branch.
 */
export interface IfStatement extends SyntaxNode {
  kind: SyntaxKind.IfStatement;

  condition: ExpressionNode;
  body: BlockStatement;
  elseBody: BlockStatement | undefined;
}

export function createIfStatement(
  condition: ExpressionNode,
  body: BlockStatement,
  elseBody?: BlockStatement,
  location?: TextRange,
): IfStatement {
  return setTextRange({
    kind: SyntaxKind.IfStatement,
    condition,
    body,
    elseBody,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printIfStatement(printer: Printer, node: IfStatement) {
  printer.indent('(IfStatement');
  printer.printNode(node.condition);
  printer.printNode(node.body);
  if (node.elseBody) {
    printer.printNode(node.elseBody);
  }
  printer.dedent(')');
}

export function bindIfStatement(binder: Binder, node: IfStatement) {
  binder.bindNode(node.condition);
  binder.bindNode(node.body);
  if (node.elseBody) {
    binder.bindNode(node.elseBody);
  }
}
