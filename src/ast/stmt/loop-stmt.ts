import { Binder } from '../../bind/binder';
import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';
import { BlockStatement } from './block-stmt';

/**
 * A loop statement.
 */
export interface LoopStatement extends SyntaxNode {
  kind: SyntaxKind.LoopStatement;

  body: BlockStatement;
}

export function createLoopStatement(
  body: BlockStatement,
  location?: TextRange,
): LoopStatement {
  return setTextRange({
    kind: SyntaxKind.LoopStatement,
    body,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printLoopStatement(printer: Printer, node: LoopStatement) {
  printer.indent('(LoopStatement');
  printer.printNode(node.body);
  printer.dedent(')');
}

export function bindLoopStatement(binder: Binder, node: LoopStatement) {
  binder.bindNode(node.body);
}
