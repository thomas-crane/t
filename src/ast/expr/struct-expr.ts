import { ExpressionNode } from '.';
import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';
import { IdentifierExpression } from './identifier-expr';

export interface StructExpression extends SyntaxNode {
  kind: SyntaxKind.StructExpression;

  name: IdentifierExpression;
  members: Record<string, StructMemberExpression>;
}

export interface StructMemberExpression extends SyntaxNode {
  kind: SyntaxKind.StructMemberExpression;

  name: IdentifierExpression;
  value: ExpressionNode;
}

export function createStructExpression(
  name: IdentifierExpression,
  members: StructExpression['members'],
  location?: TextRange,
): StructExpression {
  return setTextRange({
    kind: SyntaxKind.StructExpression,
    name,
    members,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createStructMemberExpression(
  name: IdentifierExpression,
  value: ExpressionNode,
  location?: TextRange,
): StructMemberExpression {
  return setTextRange({
    kind: SyntaxKind.StructMemberExpression,
    name,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printStructExpression(printer: Printer, node: StructExpression) {
  printer.indent('(StructExpression');
  printer.printNode(node.name);
  // tslint:disable-next-line: forin
  for (const name in node.members) {
    printStructMemberExpression(printer, node.members[name]);
  }
  printer.dedent(')');
}

export function printStructMemberExpression(printer: Printer, node: StructMemberExpression) {
  printer.indent('(StructMemberExpression');
  printer.printNode(node.name);
  printer.printNode(node.value);
  printer.dedent(')');
}
