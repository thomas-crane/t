import { dataFlowSourceFile, SourceFile } from '../ast/source-file';
import { BlockStatement, dataFlowBlockStatement } from '../ast/stmt/block-stmt';
import { dataFlowFnDeclarationStatement, FnDeclarationStatement } from '../ast/stmt/fn-declaration-stmt';
import { SyntaxKind } from '../ast/syntax-node';
import { DiagnosticType } from '../diagnostic';
import { unreachable } from '../utils';

type VisitableNode
  = SourceFile
  | FnDeclarationStatement
  | BlockStatement
  ;

export interface DataFlowPass {
  /**
   * Block statements which have already been visited.
   * This can be used to avoid infinite loops when
   * visiting blocks that exit into themselves.
   */
  readonly visitedBlocks: Set<BlockStatement>;
  /**
   * The diagnostics of this type checker.
   */
  readonly diagnostics: DiagnosticType[];
  visitNode(node: VisitableNode): void;
}

export function createDataFlowPass(diagnostics: DiagnosticType[]): DataFlowPass {

  return {
    diagnostics,
    visitedBlocks: new Set(),
    visitNode(node) {
      switch (node.kind) {
        case SyntaxKind.BlockStatement:
          return dataFlowBlockStatement(this, node);
        case SyntaxKind.FnDeclarationStatement:
          return dataFlowFnDeclarationStatement(this, node);
        case SyntaxKind.SourceFile:
          return dataFlowSourceFile(this, node);
      }
      unreachable(node);
    },
  };
}
