import { BlockExit, StatementNode, SyntaxKind, SyntaxNode, SyntaxNodeFlags, TextRange } from '../../types';
import { setTextRange } from '../../utils';

/**
 * A list of statements.
 */
export interface BlockStatement extends SyntaxNode {
  kind: SyntaxKind.BlockStatement;

  statements: StatementNode[];
  exits: BlockExit[];
}

export function createBlockStatement(
  statements: StatementNode[],
  location?: TextRange,
): BlockStatement {
  return setTextRange({
    kind: SyntaxKind.BlockStatement,
    statements,
    exits: [],
    flags: SyntaxNodeFlags.None,
  }, location);
}
