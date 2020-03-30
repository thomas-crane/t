import { IdentifierExpression } from './ast/expr/identifier-expr';
import {
  ArrayTypeNode,
  AssignmentStatement,
  BlockExitKind,
  BlockStatement,
  DeclarationStatement,
  DiagnosticType,
  EndBlockExit,
  ExpressionNode,
  ExpressionStatement,
  FnDeclarationStatement,
  FnParameter,
  IfStatement,
  JumpBlockExit,
  LoopStatement,
  OptionalTypeNode,
  ReturnBlockExit,
  ReturnStatement,
  SourceFile,
  StatementNode,
  StopBlockExit,
  StopStatement,
  StructDeclStatement,
  StructMember,
  SyntaxKind,
  SyntaxNodeFlags,
  SyntaxToken,
  TextRange,
  TokenSyntaxKind,
  TypeNode,
  TypeReference,
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

export function createTypeReference(
  name: IdentifierExpression,
  location?: TextRange,
): TypeReference {
  return setTextRange({
    kind: SyntaxKind.TypeReference,
    name,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createArrayTypeNode(
  itemType: TypeNode,
  location?: TextRange,
): ArrayTypeNode {
  return setTextRange({
    kind: SyntaxKind.ArrayType,
    itemType,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createOptionalType(
  valueType: TypeNode,
  location?: TextRange,
): OptionalTypeNode {
  return setTextRange({
    kind: SyntaxKind.OptionalType,
    valueType,
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

export function createBlockStatement(
  statements: StatementNode[],
  location?: TextRange,
): BlockStatement {
  return setTextRange({
    kind: SyntaxKind.BlockStatement,
    statements,
    exits: [],
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createIfStatement(
  condition: ExpressionNode,
  body: BlockStatement,
  elseBody?: BlockStatement,
  location?: TextRange,
): IfStatement {
  return setTextRange({
    kind: SyntaxKind.IfStatement,
    condition,
    body,
    elseBody,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createAssignmentStatement(
  identifier: IdentifierExpression,
  value: ExpressionNode,
  location?: TextRange,
): AssignmentStatement {
  return setTextRange({
    kind: SyntaxKind.AssignmentStatement,
    identifier,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createDeclarationStatement(
  isConst: boolean,
  identifier: IdentifierExpression,
  typeNode: TypeNode | undefined,
  value: ExpressionNode,
  location?: TextRange,
): DeclarationStatement {
  return setTextRange({
    kind: SyntaxKind.DeclarationStatement,
    isConst,
    identifier,
    typeNode,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createFnParameter(
  name: IdentifierExpression,
  typeNode: TypeNode | undefined,
  location?: TextRange,
): FnParameter {
  return setTextRange({
    kind: SyntaxKind.FnParameter,
    name,
    typeNode,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createFnDeclarationStatement(
  fnName: IdentifierExpression,
  params: FnParameter[],
  returnTypeNode: TypeNode | undefined,
  body: BlockStatement,
  location?: TextRange,
): FnDeclarationStatement {
  return setTextRange({
    kind: SyntaxKind.FnDeclarationStatement,
    fnName,
    params,
    returnTypeNode,
    body,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createReturnStatement(
  value: ExpressionNode,
  location?: TextRange,
): ReturnStatement {
  return setTextRange({
    kind: SyntaxKind.ReturnStatement,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createLoopStatement(
  body: BlockStatement,
  location?: TextRange,
): LoopStatement {
  return setTextRange({
    kind: SyntaxKind.LoopStatement,
    body,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createStopStatement(
  location?: TextRange,
): StopStatement {
  return setTextRange({
    kind: SyntaxKind.StopStatement,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createExpressionStatement(
  expr: ExpressionNode,
  location?: TextRange,
): ExpressionStatement {
  return setTextRange({
    kind: SyntaxKind.ExpressionStatement,
    expr,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createStructDeclStatement(
  name: IdentifierExpression,
  members: StructDeclStatement['members'],
  location?: TextRange,
): StructDeclStatement {
  return setTextRange({
    kind: SyntaxKind.StructDeclStatement,
    name,
    members,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createStructMember(
  isConst: boolean,
  name: IdentifierExpression,
  typeNode: TypeNode | undefined,
  location?: TextRange,
): StructMember {
  return setTextRange({
    kind: SyntaxKind.StructMember,
    isConst,
    name,
    typeNode,
    flags: SyntaxNodeFlags.None,
  }, location);
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
