import { ExpressionNode } from '.';
import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';
import { SyntaxToken } from '../token';

/**
 * A binary expression such as `10 + 20`
 */
export interface BinaryExpression extends SyntaxNode {
  kind: SyntaxKind.BinaryExpression;

  left: ExpressionNode;
  operator: BinaryOperator;
  right: ExpressionNode;
}
/**
 * The set of syntax tokens which are valid binary expression operators.
 */
export type BinaryOperator
  = SyntaxToken<SyntaxKind.PlusToken>
  | SyntaxToken<SyntaxKind.MinusToken>
  | SyntaxToken<SyntaxKind.StarToken>
  | SyntaxToken<SyntaxKind.SlashToken>
  | SyntaxToken<SyntaxKind.LessThan>
  | SyntaxToken<SyntaxKind.GreaterThan>
  | SyntaxToken<SyntaxKind.EqualTo>
  | SyntaxToken<SyntaxKind.NotEqualTo>
  | SyntaxToken<SyntaxKind.LogicalAnd>
  | SyntaxToken<SyntaxKind.LogicalOr>
  ;

export function createBinaryExpression(
  left: ExpressionNode,
  operator: BinaryOperator,
  right: ExpressionNode,
  location?: TextRange,
): BinaryExpression {
  return setTextRange({
    kind: SyntaxKind.BinaryExpression,
    left,
    operator,
    right,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printBinaryExpression(printer: Printer, node: BinaryExpression) {
  printer.indent('(BinaryExpression');
  printer.printNode(node.left);
  printer.println(binaryOpToString(node.operator));
  printer.printNode(node.right);
  printer.dedent(')');
}

function binaryOpToString(op: BinaryOperator): string {
  switch (op.kind) {
    case SyntaxKind.PlusToken:
      return '+';
    case SyntaxKind.MinusToken:
      return '-';
    case SyntaxKind.StarToken:
      return '*';
    case SyntaxKind.SlashToken:
      return '/';
    case SyntaxKind.LessThan:
      return '<';
    case SyntaxKind.GreaterThan:
      return '>';
    case SyntaxKind.EqualTo:
      return '==';
    case SyntaxKind.NotEqualTo:
      return '!=';
    case SyntaxKind.LogicalAnd:
      return '&&';
    case SyntaxKind.LogicalOr:
      return '||';
  }
}
