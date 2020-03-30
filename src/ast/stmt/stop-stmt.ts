import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

/**
 * A stop statement.
 */
export interface StopStatement extends SyntaxNode {
  kind: SyntaxKind.StopStatement;
}

export function createStopStatement(
  location?: TextRange,
): StopStatement {
  return setTextRange({
    kind: SyntaxKind.StopStatement,
    flags: SyntaxNodeFlags.None,
  }, location);
}
