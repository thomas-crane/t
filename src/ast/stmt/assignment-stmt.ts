import { Binder } from '../../bind/binder';
import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { ExpressionNode } from '../expr';
import { IdentifierExpression } from '../expr/identifier-expr';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

/**
 * A variable assignment statement.
 */
export interface AssignmentStatement extends SyntaxNode {
  kind: SyntaxKind.AssignmentStatement;

  identifier: IdentifierExpression;
  value: ExpressionNode;
}

export function createAssignmentStatement(
  identifier: IdentifierExpression,
  value: ExpressionNode,
  location?: TextRange,
): AssignmentStatement {
  return setTextRange({
    kind: SyntaxKind.AssignmentStatement,
    identifier,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printAssignmentStatement(printer: Printer, node: AssignmentStatement) {
  printer.indent('(AssignmentStatement');
  printer.printNode(node.identifier);
  printer.printNode(node.value);
  printer.dedent(')');
}

export function bindAssignmentStatement(binder: Binder, node: AssignmentStatement) {
  binder.bindNode(node.identifier);
  binder.bindNode(node.value);
}
