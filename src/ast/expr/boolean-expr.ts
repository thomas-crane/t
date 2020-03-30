import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

/**
 * A boolean literal expression.
 */
export interface BooleanExpression extends SyntaxNode {
  kind: SyntaxKind.Boolean;
  value: boolean;
}

export function createBooleanExpression(
  value: boolean,
  location?: TextRange,
): BooleanExpression {
  return setTextRange({
    kind: SyntaxKind.Boolean,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printBooleanExpression(printer: Printer, node: BooleanExpression) {
  printer.println(`(BooleanExpression ${node.value})`);
}
