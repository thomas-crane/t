import { BlockExit, BlockStatement } from '../ast/stmt/block-stmt';
import { SyntaxKind, SyntaxNodeFlags } from '../ast/syntax-node';

export function getDeadEnds(block: BlockStatement): BlockStatement[] {
  const visited: Set<BlockExit> = new Set();
  function checkExits(exit: BlockExit): BlockStatement[] {
    switch (exit.kind) {
      case SyntaxKind.IfStatement:
        return [...getDeadEnds(exit.body), ...getDeadEnds(exit.elseBody)];
      case SyntaxKind.GotoStatement:
        if (visited.has(exit)) {
          // if the path has a loop, it cannot end.
          return [];
        } else {
          visited.add(exit);
          return getDeadEnds(exit.target);
        }
      case SyntaxKind.ReturnStatement:
        if (exit.flags & SyntaxNodeFlags.Synthetic) {
          return [block];
        }
        return [];
    }
  }
  return checkExits(block.exit);
}
