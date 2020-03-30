import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

/**
 * An identifier literal expression.
 */
export interface IdentifierExpression extends SyntaxNode {
  kind: SyntaxKind.Identifier;
  value: string;
}

export function createIdentifierExpression(
  value: string,
  location?: TextRange,
): IdentifierExpression {
  return setTextRange({
    kind: SyntaxKind.Identifier,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printIdentifierExpression(printer: Printer, node: IdentifierExpression) {
  printer.println(`(IdentifierExpression "${node.value}")`);
}
