import { BlockStatement } from './ast/stmt/block-stmt';
import { ReturnStatement } from './ast/stmt/return-stmt';
import { StopStatement } from './ast/stmt/stop-stmt';
import {
  BlockExitKind,
  DiagnosticType,
  EndBlockExit,
  JumpBlockExit,
  ReturnBlockExit,
  SourceFile,
  StatementNode,
  StopBlockExit,
  SyntaxKind,
  SyntaxNodeFlags,
} from './types';

export function createReturnBlockExit(
  returnNode: ReturnStatement,
): ReturnBlockExit {
  return {
    kind: BlockExitKind.Return,
    returnNode,
  };
}

export function createJumpBlockExit(
  target: BlockStatement,
): JumpBlockExit {
  return {
    kind: BlockExitKind.Jump,
    target,
  };
}

export function createStopBlockExit(
  stopNode: StopStatement,
): StopBlockExit {
  return {
    kind: BlockExitKind.Stop,
    stopNode,
  };
}

export function createEndBlockExit(): EndBlockExit {
  return {
    kind: BlockExitKind.End,
  };
}

export function createSourceFile(
  statements: StatementNode[],
  text: string,
  fileName: string,
  diagnostics?: DiagnosticType[],
): SourceFile {
  if (!diagnostics) {
    diagnostics = [];
  }
  return {
    kind: SyntaxKind.SourceFile,
    statements,
    text,
    fileName,
    flags: SyntaxNodeFlags.None,
    diagnostics,
    pos: 0,
    end: text.length - 1,
  };
}
