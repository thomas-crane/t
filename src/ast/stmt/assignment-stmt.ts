import { Binder } from '../../bind/binder';
import { DiagnosticCode } from '../../diagnostic/diagnostic-code';
import { createDiagnosticError } from '../../diagnostic/diagnostic-error';
import { DiagnosticSource } from '../../diagnostic/diagnostic-source';
import { Printer } from '../../printer';
import { VariableSymbol } from '../../symbol/variable-symbol';
import { TypeMatch } from '../../typecheck/type-match';
import { TypeChecker } from '../../typecheck/typechecker';
import { TextRange } from '../../types';
import { setTextRange, typeMatch } from '../../utils';
import { ExpressionNode } from '../expr';
import { IdentifierExpression } from '../expr/identifier-expr';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

/**
 * A variable assignment statement.
 */
export interface AssignmentStatement extends SyntaxNode {
  kind: SyntaxKind.AssignmentStatement;

  identifier: IdentifierExpression;
  value: ExpressionNode;
}

export function createAssignmentStatement(
  identifier: IdentifierExpression,
  value: ExpressionNode,
  location?: TextRange,
): AssignmentStatement {
  return setTextRange({
    kind: SyntaxKind.AssignmentStatement,
    identifier,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printAssignmentStatement(printer: Printer, node: AssignmentStatement) {
  printer.indent('(AssignmentStatement');
  printer.printNode(node.identifier);
  printer.printNode(node.value);
  printer.dedent(')');
}

export function bindAssignmentStatement(binder: Binder, node: AssignmentStatement) {
  binder.bindNode(node.identifier);
  binder.bindNode(node.value);
}

export function checkAssignmentStatement(checker: TypeChecker, node: AssignmentStatement) {
  const varSymbol = node.symbol as VariableSymbol | undefined;
  if (varSymbol === undefined) {
    return;
  }
  // make sure we're not assigning to a const variable.
  if (varSymbol.isConst) {
    checker.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Checker,
      DiagnosticCode.CannotAssignToConst,
      `Cannot assign to "${varSymbol.name}" because it is not mutable.`,
      { pos: node.identifier.pos, end: node.identifier.end },
    ));
  }

  const expectedType = varSymbol.firstMention.type;
  if (expectedType === undefined) {
    return undefined;
  }
  checker.checkNode(node.value, expectedType);
  const match = typeMatch(node.value.type, expectedType);
  if (match !== TypeMatch.Equal) {
    checker.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Checker,
      DiagnosticCode.UnexpectedType,
      `Expected a value of type ${expectedType.name}`,
      { pos: node.identifier.pos, end: node.identifier.end },
    ));
  }
}
