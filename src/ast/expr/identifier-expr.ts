import { Binder } from '../../bind/binder';
import { DiagnosticCode } from '../../diagnostic/diagnostic-code';
import { createDiagnosticError } from '../../diagnostic/diagnostic-error';
import { DiagnosticSource } from '../../diagnostic/diagnostic-source';
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

export function bindIdentifierExpression(binder: Binder, node: IdentifierExpression) {
  const varSymbol = binder.valueSymbolTable.get(node.value);
  if (varSymbol !== undefined) {
    varSymbol.references.push(node);
    node.symbol = varSymbol;
  } else {
    binder.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Binder,
      DiagnosticCode.UnknownSymbol,
      `Cannot find name "${node.value}"`,
      {
        pos: node.pos,
        end: node.end,
      },
    ));
    node.flags |= SyntaxNodeFlags.HasErrors;
  }
}
