import { Binder } from '../../bind/binder';
import { DiagnosticCode } from '../../diagnostic/diagnostic-code';
import { createDiagnosticError } from '../../diagnostic/diagnostic-error';
import { DiagnosticSource } from '../../diagnostic/diagnostic-source';
import { DataFlowPass } from '../../flow/data-flow';
import { Printer } from '../../printer';
import { TypeMatch } from '../../typecheck/type-match';
import { TypeChecker } from '../../typecheck/typechecker';
import { TextRange } from '../../types';
import { setTextRange, typeMatch } from '../../utils';
import { ExpressionNode } from '../expr';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';
import { BlockStatement } from './block-stmt';

/**
 * An if statement with an optional else branch.
 */
export interface IfStatement extends SyntaxNode {
  kind: SyntaxKind.IfStatement;

  condition: ExpressionNode;
  body: BlockStatement;
  elseBody: BlockStatement;
}

export function createIfStatement(
  condition: ExpressionNode,
  body: BlockStatement,
  elseBody: BlockStatement,
  location?: TextRange,
): IfStatement {
  return setTextRange({
    kind: SyntaxKind.IfStatement,
    condition,
    body,
    elseBody,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printIfStatement(printer: Printer, node: IfStatement) {
  printer.indent('(IfStatement');
  printer.printNode(node.condition);
  printer.printNode(node.body);
  if (node.elseBody) {
    printer.printNode(node.elseBody);
  }
  printer.dedent(')');
}

export function bindIfStatement(binder: Binder, node: IfStatement) {
  binder.bindNode(node.condition);
  binder.bindNode(node.body);
  if (node.elseBody) {
    binder.bindNode(node.elseBody);
  }
}

export function checkIfStatement(checker: TypeChecker, node: IfStatement) {
  // TODO(thomas.crane): reimplement type narrowing.
  checker.checkNode(node.condition);
  const boolType = checker.typeTable.get('bool')!;
  const conditionMatch = typeMatch(node.condition.type, boolType);
  if (conditionMatch !== TypeMatch.Equal) {
    checker.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Checker,
      DiagnosticCode.UnexpectedType,
      `Expected a value of type ${boolType.name}`,
      { pos: node.condition.pos, end: node.condition.end },
    ));
  }
  checker.checkNode(node.body);
  if (node.elseBody) {
    checker.checkNode(node.elseBody);
  }
}

export function dataFlowIfStatement(pass: DataFlowPass, node: IfStatement) {
  pass.visitNode(node.body);
  pass.visitNode(node.elseBody);
}
