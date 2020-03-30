import { BlockStatement } from './ast/stmt/block-stmt';
import { ReturnStatement } from './ast/stmt/return-stmt';
import { StopStatement } from './ast/stmt/stop-stmt';
import {
  BlockExitKind,
  EndBlockExit,
  JumpBlockExit,
  ReturnBlockExit,
  StopBlockExit,
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
