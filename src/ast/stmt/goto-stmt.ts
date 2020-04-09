import { Binder } from '../../bind/binder';
import { DataFlowPass } from '../../flow/data-flow';
import { Printer } from '../../printer';
import { TypeChecker } from '../../typecheck/typechecker';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';
import { BlockStatement } from './block-stmt';

/**
 * An unconditional jump into a block.
 */
export interface GotoStatement extends SyntaxNode {
  kind: SyntaxKind.GotoStatement;
  target: BlockStatement;
}

export function createGotoStatement(
  target: BlockStatement,
  location?: TextRange,
): GotoStatement {
  return setTextRange({
    kind: SyntaxKind.GotoStatement,
    target,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printGotoStatement(printer: Printer, node: GotoStatement) {
  printer.indent('(GotoStatement');
  printer.printNode(node.target);
  printer.dedent(')');
}

export function bindGotoStatement(binder: Binder, node: GotoStatement) {
  binder.bindNode(node.target);
}

export function checkGotoStatement(checker: TypeChecker, node: GotoStatement) {
  checker.checkNode(node.target);
}

export function dataFlowGotoStatement(pass: DataFlowPass, node: GotoStatement) {
  pass.visitNode(node.target);
}
