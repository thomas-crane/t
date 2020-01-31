import {
  AssignmentStatement,
  BinaryExpression,
  BinaryOperator,
  BlockStatement,
  DeclarationStatement,
  ExpressionStatement,
  FnCallExpression,
  FnDeclarationStatement,
  IdentifierLiteral,
  IfStatement,
  LoopStatement,
  Node,
  NumberLiteral,
  ParenExpression,
  ReturnStatement,
  SourceFile,
  SyntaxKind,
} from './types';

const INDENT_SIZE = 2;

/**
 * Converts the given node into an S-expression like string.
 */
export function printNode(node: Node): string {
  switch (node.kind) {
    case SyntaxKind.IdentifierLiteral:
      return printIdentifierLiteral(node);
    case SyntaxKind.NumberLiteral:
      return printNumberLiteral(node);

    case SyntaxKind.BinaryExpression:
      return printBinaryExpression(node);
    case SyntaxKind.FnCallExpression:
      return printFnCallExpression(node);
    case SyntaxKind.ParenExpression:
      return printParenExpression(node);

    case SyntaxKind.BlockStatement:
      return printBlockStatement(node);
    case SyntaxKind.IfStatement:
      return printIfStatement(node);
    case SyntaxKind.AssignmentStatement:
      return printAssignmentStatement(node);
    case SyntaxKind.DeclarationStatement:
      return printDeclarationStatement(node);
    case SyntaxKind.FnDeclarationStatement:
      return printFnDeclarationStatement(node);
    case SyntaxKind.ReturnStatement:
      return printReturnStatement(node);
    case SyntaxKind.LoopStatement:
      return printLoopStatement(node);
    case SyntaxKind.ExpressionStatement:
      return printExpressionStatement(node);

    case SyntaxKind.SourceFile:
      return printSourceFile(node);
  }
}

function printIdentifierLiteral(node: IdentifierLiteral): string {
  return `(IdentifierLiteral "${node.value}")`;
}

function printNumberLiteral(node: NumberLiteral): string {
  return `(NumberLiteral "${node.value}")`;
}

function printBinaryExpression(node: BinaryExpression): string {
  const lhs = printNode(node.left);
  const rhs = printNode(node.right);
  const op = binaryOpToString(node.operator);
  return [
    '(BinaryExpression',
    ...indent([
      lhs,
      op,
      rhs,
    ], INDENT_SIZE),
    ')',
  ].join('\n');
}
function binaryOpToString(op: BinaryOperator): string {
  switch (op.kind) {
    case SyntaxKind.PlusToken:
      return '+';
    case SyntaxKind.MinusToken:
      return '-';
    case SyntaxKind.StarToken:
      return '*';
    case SyntaxKind.SlashToken:
      return '/';
    case SyntaxKind.LessThan:
      return '<';
    case SyntaxKind.GreaterThan:
      return '>';
    case SyntaxKind.EqualTo:
      return '==';
    case SyntaxKind.NotEqualTo:
      return '!=';
    case SyntaxKind.LogicalAnd:
      return '&&';
    case SyntaxKind.LogicalOr:
      return '||';
  }
}

function printFnCallExpression(node: FnCallExpression): string {
  const name = printNode(node.fnName);
  const args = node.args.map((arg) => printNode(arg));
  return [
    '(FnCallExpression',
    ...indent([
      name,
      ...args,
    ], INDENT_SIZE),
    ')',
  ].join('\n');
}

function printParenExpression(node: ParenExpression): string {
  const expr = printNode(node.expr);
  return `(ParenExpression ${expr})`;
}

function printBlockStatement(node: BlockStatement): string {
  const statements = node.statements.map((stmt) => printNode(stmt));
  const indented = indent(statements, 2);
  return [
    '(BlockStatement',
    ...indented,
    ')',
  ].join('\n');
}

function printIfStatement(node: IfStatement): string {
  const condition = printNode(node.condition);
  const body = printNode(node.body);
  const result = [
    '(IfStatement',
    ...indent([
      condition,
      body,
    ], INDENT_SIZE),
  ];
  if (node.elseBody) {
    const elseBody = printNode(node.elseBody);
    result.push(...indent([elseBody], INDENT_SIZE));
  }
  result.push(')');
  return result.join('\n');
}

function printAssignmentStatement(node: AssignmentStatement): string {
  const identifier = printNode(node.identifier);
  const value = printNode(node.value);
  return [
    '(AssignmentStatement',
    ...indent([
      identifier,
      value,
    ], INDENT_SIZE),
    ')',
  ].join('\n');
}

function printDeclarationStatement(node: DeclarationStatement): string {
  const identifier = printNode(node.identifier);
  const value = printNode(node.value);
  const declType = node.isConst ? 'LetKeyword' : 'MutKeyword';
  return [
    '(DeclarationStatement',
    ...indent([
      declType,
      identifier,
      value,
    ], INDENT_SIZE),
    ')',
  ].join('\n');
}

function printFnDeclarationStatement(node: FnDeclarationStatement): string {
  const fnName = printNode(node.fnName);
  const params = node.params.map((param) => printNode(param));
  const body = printNode(node.body);
  return [
    '(FnDeclarationStatement',
    ...indent([
      fnName,
      ...params,
      body,
    ], INDENT_SIZE),
    ')',
  ].join('\n');
}

function printReturnStatement(node: ReturnStatement): string {
  const value = printNode(node.value);
  return `(ReturnStatement ${value})`;
}

function printLoopStatement(node: LoopStatement): string {
  const body = printNode(node.body);
  return [
    '(LoopStatement',
    ...indent([body], 2),
    ')',
  ].join('\n');
}

function printExpressionStatement(node: ExpressionStatement): string {
  const expr = printNode(node.expr);
  return `(ExpressionStatement ${expr})`;
}

function printSourceFile(node: SourceFile): string {
  const statements = node.statements.map((statement) => printNode(statement));
  return [
    '(SourceFile',
    ...indent(statements, INDENT_SIZE),
    ')',
  ].join('\n');
}

function indent(lines: string[], count: number): string[] {
  const result: string[] = [];
  for (const line of lines) {
    // check if lines need to be recursively indented.
    const parts = line.split('\n');
    if (parts.length !== 1) {
      result.push(...indent(parts, count));
    } else {
      result.push(`${' '.repeat(count)}${line}`);
    }
  }
  return result;
}
