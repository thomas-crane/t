import { Binder } from '../../bind/binder';
import { DiagnosticCode } from '../../diagnostic/diagnostic-code';
import { createDiagnosticError } from '../../diagnostic/diagnostic-error';
import { DiagnosticSource } from '../../diagnostic/diagnostic-source';
import { Printer } from '../../printer';
import { TypeMatch } from '../../typecheck/type-match';
import { TypeChecker } from '../../typecheck/typechecker';
import { TextRange } from '../../types';
import { setTextRange, typeMatch } from '../../utils';
import { ExpressionNode } from '../expr';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

/**
 * A return statement.
 */
export interface ReturnStatement extends SyntaxNode {
  kind: SyntaxKind.ReturnStatement;

  value: ExpressionNode;
}

export function createReturnStatement(
  value: ExpressionNode,
  location?: TextRange,
): ReturnStatement {
  return setTextRange({
    kind: SyntaxKind.ReturnStatement,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printReturnStatement(printer: Printer, node: ReturnStatement) {
  printer.indent('(ReturnStatement');
  printer.printNode(node.value);
  printer.dedent(')');
}

export function bindReturnStatement(binder: Binder, node: ReturnStatement) {
  binder.bindNode(node.value);
}

export function checkReturnStatement(checker: TypeChecker, node: ReturnStatement) {
  if (checker.currentFn !== undefined) {
    const expectedType = checker.currentFn.returnTypeNode?.type;
    checker.checkNode(node.value, expectedType);
    if (expectedType !== undefined) {
      const match = typeMatch(node.value.type, expectedType);
      if (match !== TypeMatch.Equal) {
        checker.diagnostics.push(createDiagnosticError(
          DiagnosticSource.Checker,
          DiagnosticCode.UnexpectedType,
          `Expected a value of type ${expectedType.name}`,
          { pos: node.value.pos, end: node.value.end },
        ));
      }
    }
  } else {
    checker.checkNode(node.value);
  }
}
