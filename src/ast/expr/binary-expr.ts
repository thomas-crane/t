import {
  ExpressionNode,
  SyntaxKind,
  SyntaxNode,
  SyntaxNodeFlags,
  SyntaxToken,
  TextRange,
} from '../../types';
import { setTextRange } from '../../utils';

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
