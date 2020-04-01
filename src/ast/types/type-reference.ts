import { Binder } from '../../bind/binder';
import { DiagnosticCode } from '../../diagnostic/diagnostic-code';
import { createDiagnosticError } from '../../diagnostic/diagnostic-error';
import { DiagnosticSource } from '../../diagnostic/diagnostic-source';
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

export function bindTypeReference(binder: Binder, node: TypeReference) {
  const typeSymbol = binder.typeSymbolTable.get(node.name.value);
  if (typeSymbol !== undefined) {
    node.name.symbol = typeSymbol;
    typeSymbol.references.push(node.name);
  } else {
    binder.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Binder,
      DiagnosticCode.UnknownSymbol,
      `Cannot find name "${node.name.value}"`,
      {
        pos: node.pos,
        end: node.end,
      },
    ));
    node.flags |= SyntaxNodeFlags.HasErrors;
  }
}
