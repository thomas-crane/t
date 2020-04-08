import { BlockEnd, BlockEndKind } from '../ast/stmt/block-end';
import { BlockStatement } from '../ast/stmt/block-stmt';
import { SyntaxKind } from '../ast/syntax-node';

export function getDeadEnds(block: BlockStatement): BlockStatement[] {
  return getAllEnds(block)
    .filter((end) => end.exit.kind === SyntaxKind.BlockEnd)
    .filter((end) => (end.exit as BlockEnd).endKind === BlockEndKind.End);
}

export function getAllEnds(block: BlockStatement): BlockStatement[] {
  // add the initial block to the visited list.
  const visited: Set<BlockStatement> = new Set([block]);

  function getEnds(currentBlock: BlockStatement): BlockStatement[] {
    switch (currentBlock.exit.kind) {
      case SyntaxKind.IfStatement:
        // make sure the if statement does not cause a loop.
        let bodyEnds: BlockStatement[];
        if (visited.has(currentBlock.exit.body)) {
          bodyEnds = [];
        } else {
          visited.add(currentBlock.exit.body);
          bodyEnds = getEnds(currentBlock.exit.body);
        }
        let elseBodyEnds: BlockStatement[];
        if (visited.has(currentBlock.exit.elseBody)) {
          elseBodyEnds = [];
        } else {
          visited.add(currentBlock.exit.elseBody);
          elseBodyEnds = getAllEnds(currentBlock.exit.elseBody);
        }
        return [...bodyEnds, ...elseBodyEnds];
      case SyntaxKind.GotoStatement:
        if (visited.has(currentBlock)) {
          // if this exit has been visited before,
          // the graph has become a loop.
          return [];
        } else {
          visited.add(currentBlock);
          return getAllEnds(currentBlock.exit.target);
        }
      case SyntaxKind.ReturnStatement:
      case SyntaxKind.BlockEnd:
        return [currentBlock];
    }
  }
  return getEnds(block);
}
