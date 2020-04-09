import { SourceFile } from '../ast/source-file';
import { BlockStatement } from '../ast/stmt/block-stmt';
import { GotoStatement } from '../ast/stmt/goto-stmt';
import { SyntaxKind } from '../ast/syntax-node';

type VisitableNode
  = SourceFile
  | BlockStatement
  ;

export interface BlockThreader {
  threadNode(node: VisitableNode): void;
}

export function createBlockThreader(): BlockThreader {
  function threadSourceFile(node: SourceFile) {
    for (const stmt of node.statements) {
      if (stmt.kind === SyntaxKind.FnDeclarationStatement) {
        threadNode(stmt.body);
      }
    }
  }

  function canThread(block: BlockStatement) {
    // we can thread a block if and only if it
    // is entirely empty, and its exit is a goto.
    return block.statements.length === 0
      && block.afterExit.length === 0
      && block.exit.kind === SyntaxKind.GotoStatement;
  }

  const threaded: Set<BlockStatement> = new Set();
  function threadBlockStatement(node: BlockStatement) {
    // if this block exit is a jump into another block,
    if (node.exit.kind === SyntaxKind.GotoStatement) {
      const target = node.exit.target;
      // don't attempt to thread a block that we've already threaded.
      if (!threaded.has(target)) {
        threaded.add(target);
        // thread the target.
        threadNode(target);
      }

      // we can only thread this goto if the target is completely
      // empty, otherwise we are removing scope information.
      if (!canThread(target)) {
        return;
      }

      // thead the block.
      node.exit = target.exit;
      node.symbolTable = target.symbolTable;
      node.end = target.end;
      return;
    }

    switch (node.exit.kind) {
      case SyntaxKind.ReturnStatement:
        // can't do anything.
        return;
      case SyntaxKind.IfStatement:
        // thread the body and else body.
        threadNode(node.exit.body);
        threadNode(node.exit.elseBody);

        // if the body can be threaded, replace
        // it with its target.
        if (canThread(node.exit.body)) {
          const target = (node.exit.body.exit as GotoStatement).target;
          node.exit.body = target;
        }
        // same for the else body
        if (canThread(node.exit.elseBody)) {
          const target = (node.exit.elseBody.exit as GotoStatement).target;
          node.exit.elseBody = target;
        }
        return;
    }
  }

  function threadNode(node: VisitableNode) {
    switch (node.kind) {
      case SyntaxKind.SourceFile:
        return threadSourceFile(node);
      case SyntaxKind.BlockStatement:
        return threadBlockStatement(node);
    }
  }

  return { threadNode };
}
