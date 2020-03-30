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
