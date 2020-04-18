import { ExpressionSyntaxNode } from '.';
import { Binder } from '../../bind/binder';
import { DiagnosticCode } from '../../diagnostic/diagnostic-code';
import { createDiagnosticError } from '../../diagnostic/diagnostic-error';
import { DiagnosticSource } from '../../diagnostic/diagnostic-source';
import { Printer } from '../../printer';
import { TypeChecker } from '../../typecheck/typechecker';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNodeFlags } from '../syntax-node';

/**
 * An identifier literal expression.
 */
export interface NameExpression extends ExpressionSyntaxNode {
  kind: SyntaxKind.Name;
  value: string;
}

export function createNameExpression(
  value: string,
  location?: TextRange,
): NameExpression {
  return setTextRange({
    kind: SyntaxKind.Name,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printNameExpression(printer: Printer, node: NameExpression) {
  printer.println(`(NameExpression "${node.value}")`);
}

export function bindNameExpression(binder: Binder, node: NameExpression) {
  const varSymbol = binder.nearestSymbolTable.get(node.value);
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

export function checkNameExpression(checker: TypeChecker, node: NameExpression) {
  if (node.symbol === undefined) {
    return;
  }
  // see if there is a narrowed type for this name.
  if (checker.narrowedTypes.get(node.symbol) !== undefined) {
    node.type = checker.narrowedTypes.get(node.symbol);
  } else {
    node.type = node.symbol.name.type;
  }
}
