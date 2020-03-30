import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { IdentifierExpression } from '../expr/identifier-expr';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

/**
 * An identifier used in a context where it is
 * referring to the name of a type.
 */
export interface TypeReference extends SyntaxNode {
  kind: SyntaxKind.TypeReference;
  name: IdentifierExpression;
}

export function createTypeReference(
  name: IdentifierExpression,
  location?: TextRange,
): TypeReference {
  return setTextRange({
    kind: SyntaxKind.TypeReference,
    name,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printTypeReference(printer: Printer, node: TypeReference) {
  printer.indent('(TypeReference');
  printer.printNode(node.name);
  printer.dedent(')');
}
