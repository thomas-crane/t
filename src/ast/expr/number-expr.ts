import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

/**
 * A number literal expression.
 */
export interface NumberExpression extends SyntaxNode {
  kind: SyntaxKind.Number;
  value: number;
}

export function createNumberExpression(
  value: number,
  location?: TextRange,
): NumberExpression {
  return setTextRange({
    kind: SyntaxKind.Number,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printNumberExpression(printer: Printer, node: NumberExpression) {
  printer.println(`(NumberExpression ${node.value})`);
}
