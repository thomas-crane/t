import {
  ArrayExpression,
  ArrayTypeNode,
  AssignmentStatement,
  BinaryExpression,
  BinaryOperator,
  BlockStatement,
  BooleanNode,
  DeclarationStatement,
  DiagnosticType,
  ExpressionNode,
  ExpressionStatement,
  FnCallExpression,
  FnDeclarationStatement,
  FnParameter,
  IdentifierNode,
  IfStatement,
  LoopStatement,
  NumberNode,
  ParenExpression,
  ReturnStatement,
  SourceFile,
  StatementNode,
  StopStatement,
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

export function createNumberNode(
  value: number,
  location?: TextRange,
): NumberNode {
  return setTextRange({
    kind: SyntaxKind.Number,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createIdentifierNode(
  value: string,
  location?: TextRange,
): IdentifierNode {
  return setTextRange({
    kind: SyntaxKind.Identifier,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createBooleanNode(
  value: boolean,
  location?: TextRange,
): BooleanNode {
  return setTextRange({
    kind: SyntaxKind.Boolean,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createTypeReference(
  name: IdentifierNode,
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

export function createBinaryExpression(
  left: ExpressionNode,
  operator: BinaryOperator,
  right: ExpressionNode,
  location?: TextRange,
): BinaryExpression {
  return setTextRange({
    kind: SyntaxKind.BinaryExpression,
    left,
    operator,
    right,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createFnCallExpression(
  fnName: IdentifierNode,
  args: ExpressionNode[],
  location?: TextRange,
): FnCallExpression {
  return setTextRange({
    kind: SyntaxKind.FnCallExpression,
    fnName,
    args,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createParenExpression(
  expr: ExpressionNode,
  location?: TextRange,
): ParenExpression {
  return setTextRange({
    kind: SyntaxKind.ParenExpression,
    expr,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createArrayExpression(
  items: ExpressionNode[],
  location?: TextRange,
): ArrayExpression {
  return setTextRange({
    kind: SyntaxKind.ArrayExpression,
    items,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createBlockStatement(
  statements: StatementNode[],
  location?: TextRange,
): BlockStatement {
  return setTextRange({
    kind: SyntaxKind.BlockStatement,
    statements,
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
  identifier: IdentifierNode,
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
  identifier: IdentifierNode,
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
  name: IdentifierNode,
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
  fnName: IdentifierNode,
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
