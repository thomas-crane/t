import { ExpressionNode } from '.';
import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';
import { IdentifierExpression } from './identifier-expr';

export interface MemberAccessExpression extends SyntaxNode {
  kind: SyntaxKind.MemberAccessExpression;

  target: ExpressionNode;
  member: IdentifierExpression;
}

export function createMemberAccessExpression(
  target: ExpressionNode,
  member: IdentifierExpression,
  location?: TextRange,
): MemberAccessExpression {
  return setTextRange({
    kind: SyntaxKind.MemberAccessExpression,
    target,
    member,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printMemberAccessExpression(printer: Printer, node: MemberAccessExpression) {
  printer.indent('(MemberAccessExpression');
  printer.printNode(node.target);
  printer.printNode(node.member);
  printer.dedent(')');
}
