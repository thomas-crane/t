import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

/**
 * The end of a block. This node is always synthetic
 * because it is implicit.
 */
export interface BlockEnd extends SyntaxNode {
  kind: SyntaxKind.BlockEnd;
}

export function createBlockEnd(location?: TextRange): BlockEnd {
  return setTextRange({
    kind: SyntaxKind.BlockEnd,
    flags: SyntaxNodeFlags.Synthetic,
  }, location);
}
