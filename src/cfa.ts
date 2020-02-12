import { createEndBlockExit, createJumpBlockExit, createReturnBlockExit, createStopBlockExit } from './factory';
import {
  BlockExitKind,
  BlockStatement,
  ControlFlowAnalyser,
  IfStatement,
  LoopStatement,
  Node,
  ReturnStatement,
  StopStatement,
  SyntaxKind,
} from './types';

export function createControlFlowAnalyser(): ControlFlowAnalyser {
  const blocks: BlockStatement[] = [];
  function pushBlock(block: BlockStatement) {
    blocks.unshift(block);
  }
  function popBlock() {
    blocks.shift();
  }

  function analyse(node: Node) {
    switch (node.kind) {
      case SyntaxKind.BlockStatement:
        return analyseBlockStatement(node);
      case SyntaxKind.IfStatement:
        return analyseIfStatement(node);
      case SyntaxKind.ReturnStatement:
        return analyseReturnStatement(node);
      case SyntaxKind.LoopStatement:
        return analyseLoopStatement(node);
      case SyntaxKind.StopStatement:
        return analyseStopStatement(node);
    }
  }

  function analyseBlockStatement(node: BlockStatement) {
    pushBlock(node);
    for (const child of node.statements) {
      analyse(child);
      switch (child.kind) {
        case SyntaxKind.ReturnStatement:
        case SyntaxKind.StopStatement:
          // anything after this is unreachable so just
          // pop the block and move along.
          popBlock();
          return;
        case SyntaxKind.IfStatement: {
          const jumpToBody = createJumpBlockExit(child.body);
          blocks[0].exits.push(jumpToBody);

          // check if we need a jump to else as well.
          if (child.elseBody !== undefined) {
            const jumpToElse = createJumpBlockExit(child.elseBody);
            blocks[0].exits.push(jumpToElse);

            // if both the body and the else body have no end, then
            // this block cannot have an end either, so we're done.
            const bodyEnds = child.body.exits.some((exit) => exit.kind === BlockExitKind.End);
            const elseBodyEnds = child.elseBody.exits.some((exit) => exit.kind === BlockExitKind.End);
            if (!bodyEnds && !elseBodyEnds) {
              popBlock();
              return;
            }
          }
          break;
        }
        case SyntaxKind.LoopStatement: {
          const jumpToBody = createJumpBlockExit(child.body);
          blocks[0].exits.push(jumpToBody);
          // if the body does not end, then the current block cannot
          // continue, so just pop it and keep going.
          if (!child.body.exits.some((exit) => exit.kind === BlockExitKind.End)) {
            popBlock();
            return;
          }
        }
      }
    }
    // if we got to this point then this block needs an end exit.
    blocks[0].exits.push(createEndBlockExit());
    popBlock();
  }

  function analyseIfStatement(node: IfStatement) {
    analyse(node.body);
    if (node.elseBody !== undefined) {
      analyse(node.elseBody);
    }
  }

  function analyseReturnStatement(node: ReturnStatement) {
    if (blocks.length > 0) {
      const exitNode = createReturnBlockExit(node);
      blocks[0].exits.push(exitNode);
    }
  }

  function analyseLoopStatement(node: LoopStatement) {
    analyse(node.body);
  }

  function analyseStopStatement(node: StopStatement) {
    if (blocks.length > 0) {
      // we push an end node as well since a stop indicates
      // that the current block stops, but the end indicates
      // that the containing block can continue. This isn't the
      // case for return statements so it's only necessary here.
      const stopNode = createStopBlockExit(node);
      const endNode = createEndBlockExit();
      blocks[0].exits.push(stopNode, endNode);
    }
  }

  return {
    analyse(source) {
      for (const node of source.statements) {
        analyse(node);
      }
    },
  };
}
