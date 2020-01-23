import { IdentifierLiteral, NumberLiteral, SyntaxKind, SyntaxNodeFlags, SyntaxToken, TokenSyntaxKind, ExpressionNode, BinaryOperator, BinaryExpression, FnCallExpression, StatementNode, BlockStatement, IfStatement, AssignmentStatement, DeclarationStatement, FnDeclarationStatement, ReturnStatement, LoopStatement, SourceFile } from 't/types';

export function createToken<T extends TokenSyntaxKind>(tokenKind: T): SyntaxToken<T> {
  return {
    kind: tokenKind,
    flags: SyntaxNodeFlags.None
  };
}

export function createNumberLiteral(value: number): NumberLiteral {
  return {
    kind: SyntaxKind.NumberLiteral,
    value,
    flags: SyntaxNodeFlags.None,
  };
}

export function createIdentifier(value: string): IdentifierLiteral {
  return {
    kind: SyntaxKind.IdentifierLiteral,
    value,
    flags: SyntaxNodeFlags.None,
  };
}

export function createBinaryExpression(left: ExpressionNode, operator: BinaryOperator, right: ExpressionNode): BinaryExpression {
  return {
    kind: SyntaxKind.BinaryExpression,
    left,
    operator,
    right,
    flags: SyntaxNodeFlags.None,
  };
}

export function createFnCallExpression(fnName: IdentifierLiteral, args: ExpressionNode[]): FnCallExpression {
  return {
    kind: SyntaxKind.FnCallExpression,
    fnName,
    args,
    flags: SyntaxNodeFlags.None,
  };
}

export function createBlockStatement(statements: StatementNode[]): BlockStatement {
  return {
    kind: SyntaxKind.BlockStatement,
    statements,
    flags: SyntaxNodeFlags.None,
  };
}

export function createIfStatement(condition: ExpressionNode, body: BlockStatement, elseBody?: BlockStatement): IfStatement {
  return {
    kind: SyntaxKind.IfStatement,
    condition,
    body,
    elseBody,
    flags: SyntaxNodeFlags.None,
  };
}

export function createAssignmentStatement(identifier: IdentifierLiteral, value: ExpressionNode): AssignmentStatement {
  return {
    kind: SyntaxKind.AssignmentStatement,
    identifier,
    value,
    flags: SyntaxNodeFlags.None,
  };
}

export function createDeclarationStatement(isConst: boolean, identifier: IdentifierLiteral, value: ExpressionNode): DeclarationStatement {
  return {
    kind: SyntaxKind.DeclarationStatement,
    isConst,
    identifier,
    value,
    flags: SyntaxNodeFlags.None,
  };
}

export function createFnDeclarationStatement(fnName: IdentifierLiteral, params: IdentifierLiteral[], body: BlockStatement): FnDeclarationStatement {
  return {
    kind: SyntaxKind.FnDeclarationStatement,
    fnName,
    params,
    body,
    flags: SyntaxNodeFlags.None,
  };
}

export function createReturnStatement(value: ExpressionNode): ReturnStatement {
  return {
    kind: SyntaxKind.ReturnStatement,
    value,
    flags: SyntaxNodeFlags.None,
  };
}

export function createLoopStatement(body: BlockStatement): LoopStatement {
  return {
    kind: SyntaxKind.LoopStatement,
    body,
    flags: SyntaxNodeFlags.None,
  };
}

export function createProgramNode(statements: StatementNode[], text: string, fileName: string): SourceFile {
  return {
    kind: SyntaxKind.SourceFile,
    statements,
    text,
    fileName,
    flags: SyntaxNodeFlags.None,
  };
}
