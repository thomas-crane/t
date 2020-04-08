import { BlockEnd, BlockEndKind } from '../ast/stmt/block-end';
import { BlockExit, BlockStatement } from '../ast/stmt/block-stmt';
import { SyntaxKind } from '../ast/syntax-node';

export function getDeadEnds(block: BlockStatement): BlockStatement[] {
  return getAllEnds(block)
    .filter((end) => end.exit.kind === SyntaxKind.BlockEnd)
    .filter((end) => (end.exit as BlockEnd).endKind === BlockEndKind.End);
}

export function getAllEnds(block: BlockStatement): BlockStatement[] {
  const visited: Set<BlockExit> = new Set();
  function checkExits(exit: BlockExit): BlockStatement[] {
    switch (exit.kind) {
      case SyntaxKind.IfStatement:
        // check for statements that exit into themselves.
        let bodyEnds: BlockStatement[];
        if (exit.body.exit === exit) {
          bodyEnds = [];
        } else {
          bodyEnds = getAllEnds(exit.body);
        }
        let elseBodyEnds: BlockStatement[];
        if (exit.elseBody.exit === exit) {
          elseBodyEnds = [];
        } else {
          elseBodyEnds = getAllEnds(exit.elseBody);
        }
        return [...bodyEnds, ...elseBodyEnds];
      case SyntaxKind.GotoStatement:
        // check for blocks that immediately loop into themselves.
        if (exit.target === block) {
          return [];
        }
        if (visited.has(exit)) {
          // if this exit has been visited before,
          // the graph has become a loop.
          return [];
        } else {
          visited.add(exit);
          return getAllEnds(exit.target);
        }
      case SyntaxKind.ReturnStatement:
      case SyntaxKind.BlockEnd:
        return [block];
    }
  }
  return checkExits(block.exit);
}
