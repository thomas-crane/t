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
  SyntaxToken,
  TextRange,
  TokenSyntaxKind,
} from './types';
import { setTextRange } from './utils';

export function createToken<T extends TokenSyntaxKind>(
  tokenKind: T,
  location?: TextRange,
): SyntaxToken<T> {
  return setTextRange({
    kind: tokenKind,
    flags: SyntaxNodeFlags.None,
  }, location);
}

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
