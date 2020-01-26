import {
  AssignmentStatement,
  BinaryExpression,
  BinaryOperator,
  BlockStatement,
  DeclarationStatement,
  DiagnosticType,
  ExpressionNode,
  ExpressionStatement,
  FnCallExpression,
  FnDeclarationStatement,
  IdentifierLiteral,
  IfStatement,
  LoopStatement,
  NumberLiteral,
  ReturnStatement,
  SourceFile,
  StatementNode,
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

export function createNumberLiteral(
  value: number,
  location?: TextRange,
): NumberLiteral {
  return setTextRange({
    kind: SyntaxKind.NumberLiteral,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createIdentifier(
  value: string,
  location?: TextRange,
): IdentifierLiteral {
  return setTextRange({
    kind: SyntaxKind.IdentifierLiteral,
    value,
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
  fnName: IdentifierLiteral,
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
  identifier: IdentifierLiteral,
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
  identifier: IdentifierLiteral,
  value: ExpressionNode,
  location?: TextRange,
): DeclarationStatement {
  return setTextRange({
    kind: SyntaxKind.DeclarationStatement,
    isConst,
    identifier,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createFnDeclarationStatement(
  fnName: IdentifierLiteral,
  params: IdentifierLiteral[],
  body: BlockStatement,
  location?: TextRange,
): FnDeclarationStatement {
  return setTextRange({
    kind: SyntaxKind.FnDeclarationStatement,
    fnName,
    params,
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
