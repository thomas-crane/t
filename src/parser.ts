import {
  createAssignmentStatement,
  createBinaryExpression,
  createBlockStatement,
  createBooleanNode,
  createDeclarationStatement,
  createExpressionStatement,
  createFnCallExpression,
  createFnDeclarationStatement,
  createFnParameter,
  createIdentifierNode,
  createIfStatement,
  createLoopStatement,
  createNumberNode,
  createParenExpression,
  createReturnStatement,
  createSourceFile,
  createStopStatement,
  createToken,
  createTypeReference,
} from './factory';
import { createLexer } from './lexer';
import {
  AssignmentStatement,
  BinaryOperator,
  BlockStatement,
  BooleanNode,
  DeclarationStatement,
  DiagnosticCode,
  DiagnosticKind,
  DiagnosticSource,
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
  Parser,
  ReturnStatement,
  SourceFile,
  StatementNode,
  StopStatement,
  SyntaxKind,
  SyntaxNodeFlags,
  SyntaxToken,
  TokenSyntaxKind,
  TypeNode,
  TypeReference,
} from './types';

export function createParser(source: SourceFile): Parser {
  const parsedSource = createSourceFile([], source.text, source.fileName);
  const lexer = createLexer(source.text);
  const tokens: Array<SyntaxToken<TokenSyntaxKind>> = [];
  while (true) {
    const token = lexer.nextToken();
    // skip unknown tokens, they will just cause
    // superfluous diagnostic messages.
    if (token.kind !== SyntaxKind.UnknownToken) {
      tokens.push(token);
    }
    if (token.kind === SyntaxKind.EndOfFileToken) {
      break;
    }
  }
  parsedSource.diagnostics.push(...lexer.getDiagnostics());
  let idx = 0;

  function atEnd() {
    return idx === tokens.length;
  }
  function getBinaryPrecedence(kind: SyntaxKind): number {
    switch (kind) {
      case SyntaxKind.SlashToken:
      case SyntaxKind.StarToken:
        return 5;
      case SyntaxKind.PlusToken:
      case SyntaxKind.MinusToken:
        return 4;
      case SyntaxKind.LessThan:
      case SyntaxKind.GreaterThan:
      case SyntaxKind.EqualTo:
      case SyntaxKind.NotEqualTo:
        return 3;
      case SyntaxKind.LogicalAnd:
        return 2;
      case SyntaxKind.LogicalOr:
        return 1;
      default:
        return 0;
    }
  }
  function consume<T extends TokenSyntaxKind>(expected: T): SyntaxToken<T> {
    if (tokens[idx].kind !== expected) {
      parsedSource.diagnostics.push({
        kind: DiagnosticKind.Error,
        source: DiagnosticSource.Parser,
        code: DiagnosticCode.UnexpectedToken,
        pos: tokens[idx].pos,
        end: tokens[idx].end,
        error: `Unexpected token ${SyntaxKind[tokens[idx].kind]}. Expected ${SyntaxKind[expected]}`,
      });
      const token = createToken(expected);
      token.flags |= SyntaxNodeFlags.Synthetic;
      return token;
    } else {
      const token = tokens[idx] as SyntaxToken<T>;
      idx++;
      return token;
    }
  }

  function parseTypeAnnotation(): TypeNode {
    consume(SyntaxKind.ColonToken);
    switch (tokens[idx].kind) {
      case SyntaxKind.NumKeyword:
        return consume(SyntaxKind.NumKeyword);
      case SyntaxKind.BoolKeyword:
        return consume(SyntaxKind.BoolKeyword);
      case SyntaxKind.IdentifierToken:
        return parseTypeReference();
    }
    throw new Error('parseTypeReference should not have been called');
  }

  function parseTypeReference(): TypeReference {
    const typeName = parseIdentifierNode();
    return createTypeReference(typeName, { pos: typeName.pos, end: typeName.end });
  }

  function parseStatement(): StatementNode | undefined {
    switch (tokens[idx].kind) {
      case SyntaxKind.LeftCurlyToken:
        return parseBlockStatement();
      case SyntaxKind.LetKeyword:
      case SyntaxKind.MutKeyword:
        return parseDeclarationStatement();
      case SyntaxKind.FnKeyword:
        return parseFnDeclarationStatement();
      case SyntaxKind.IfKeyword:
        return parseIfStatement();
      case SyntaxKind.LoopKeyword:
        return parseLoopStatement();
      case SyntaxKind.StopKeyword:
        return parseStopStatement();
      case SyntaxKind.ReturnKeyword:
        return parseReturnStatement();
      case SyntaxKind.IdentifierToken:
        if (tokens[idx + 1] && tokens[idx + 1].kind === SyntaxKind.EqualsToken) {
          return parseAssignmentStatement();
        } else {
          return parseExpressionStatement();
        }
      default:
        return parseExpressionStatement();
    }
  }
  function parseBlockStatement(): BlockStatement {
    const start = consume(SyntaxKind.LeftCurlyToken);
    const statements: StatementNode[] = [];
    while (!atEnd() && tokens[idx].kind !== SyntaxKind.RightCurlyToken) {
      const statement = parseStatement();
      if (statement) {
        statements.push(statement);
      }
    }
    const end = consume(SyntaxKind.RightCurlyToken);
    return createBlockStatement(statements, { pos: start.pos, end: end.end });
  }

  function parseDeclarationStatement(): DeclarationStatement | undefined {
    const declKeyword = consume(tokens[idx].kind);
    const identifier = parseIdentifierNode();
    let typeNode: TypeNode | undefined;
    if (tokens[idx].kind === SyntaxKind.ColonToken) {
      typeNode = parseTypeAnnotation();
    }
    consume(SyntaxKind.EqualsToken);
    const value = parseExpression();
    if (!value) {
      return undefined;
    }
    const isConst = declKeyword.kind === SyntaxKind.LetKeyword;
    return createDeclarationStatement(isConst, identifier, typeNode, value, {
      pos: declKeyword.pos,
      end: value.end,
    });
  }

  function parseFnParameter(): FnParameter {
    const name = parseIdentifierNode();
    let typeNode: TypeNode | undefined;
    if (tokens[idx].kind === SyntaxKind.ColonToken) {
      typeNode = parseTypeAnnotation();
    }
    return createFnParameter(name, typeNode, { pos: name.pos, end: name.end });
  }

  function parseFnDeclarationStatement(): FnDeclarationStatement | undefined {
    const start = consume(SyntaxKind.FnKeyword);
    const fnName = parseIdentifierNode();
    let returnTypeNode: TypeNode | undefined;
    consume(SyntaxKind.LeftParenToken);
    // params
    const params: FnParameter[] = [];
    while (!atEnd() && tokens[idx].kind !== SyntaxKind.RightParenToken) {
      const param = parseFnParameter();
      params.push(param);
      if (tokens[idx].kind === SyntaxKind.CommaToken) {
        idx++;
      }
    }
    consume(SyntaxKind.RightParenToken);
    if (tokens[idx].kind === SyntaxKind.ColonToken) {
      returnTypeNode = parseTypeAnnotation();
    }
    const body = parseBlockStatement();
    return createFnDeclarationStatement(fnName, params, returnTypeNode, body, {
      pos: start.pos,
      end: body.end,
    });
  }

  function parseIfStatement(): IfStatement | undefined {
    const start = consume(SyntaxKind.IfKeyword);
    const condition = parseExpression();
    if (condition === undefined) {
      return undefined;
    }
    const body = parseBlockStatement();
    let elseBody: BlockStatement | undefined;
    if (tokens[idx].kind === SyntaxKind.ElseKeyword) {
      consume(SyntaxKind.ElseKeyword);
      elseBody = parseBlockStatement();
    }
    return createIfStatement(condition, body, elseBody, {
      pos: start.pos,
      end: elseBody ? elseBody.end : body.end,
    });
  }

  function parseLoopStatement(): LoopStatement {
    const start = consume(SyntaxKind.LoopKeyword);
    const body = parseBlockStatement();
    return createLoopStatement(body, { pos: start.pos, end: body.end });
  }

  function parseStopStatement(): StopStatement {
    const token = consume(SyntaxKind.StopKeyword);
    return createStopStatement({ pos: token.pos, end: token.end });
  }

  function parseReturnStatement(): ReturnStatement | undefined {
    const start = consume(SyntaxKind.ReturnKeyword);
    const value = parseExpression();
    if (value === undefined) {
      return undefined;
    }
    return createReturnStatement(value, { pos: start.pos, end: value.end });
  }

  function parseAssignmentStatement(): AssignmentStatement | undefined {
    const identifier = parseIdentifierNode();
    consume(SyntaxKind.EqualsToken);
    const value = parseExpression();
    if (value === undefined) {
      return undefined;
    }
    return createAssignmentStatement(identifier, value, {
      pos: identifier.pos,
      end: value.end,
    });
  }

  function parseExpressionStatement(): ExpressionStatement | undefined {
    const expr = parseExpression();
    if (expr === undefined) {
      return undefined;
    }
    return createExpressionStatement(expr, { pos: expr.pos, end: expr.end });
  }

  function parseExpression(): ExpressionNode | undefined {
    while (!atEnd()) {
      const expr = parseBinaryExpression();
      if (expr) {
        return expr;
      }
    }
    return undefined;
  }

  function parseBinaryExpression(parentPrecedence = 0): ExpressionNode | undefined {
    let left = parsePrimaryExpression();
    if (left === undefined) {
      return undefined;
    }
    while (!atEnd()) {
      const precedence = getBinaryPrecedence(tokens[idx].kind);
      if (precedence === 0 || precedence <= parentPrecedence) {
        break;
      } else {
        const operator = consume(tokens[idx].kind) as BinaryOperator;
        const right = parseBinaryExpression(precedence);
        if (right === undefined) {
          return undefined;
        }
        left = createBinaryExpression(left, operator, right);
      }
    }
    return left;
  }

  function parsePrimaryExpression(): ExpressionNode | undefined {
    while (!atEnd()) {
      switch (tokens[idx].kind) {
        case SyntaxKind.LeftParenToken:
          return parseParenExpression();
        case SyntaxKind.IdentifierToken:
          if (tokens[idx + 1] && tokens[idx + 1].kind === SyntaxKind.LeftParenToken) {
            return parseFnCallExpression();
          } else {
            return parseIdentifierNode();
          }
        case SyntaxKind.NumberToken:
          return parseNumberNode();
        case SyntaxKind.TrueKeyword:
        case SyntaxKind.FalseKeyword:
          return parseBooleanNode();
        default:
          parsedSource.diagnostics.push({
            kind: DiagnosticKind.Error,
            source: DiagnosticSource.Parser,
            code: DiagnosticCode.UnexpectedToken,
            pos: tokens[idx].pos,
            end: tokens[idx].end,
            error: `Unexpected token ${SyntaxKind[tokens[idx].kind]}. Expected an expression.`,
          });
          idx++;
      }
    }
    return undefined;
  }

  function parseFnCallExpression(): FnCallExpression | undefined {
    const fnName = parseIdentifierNode();
    consume(SyntaxKind.LeftParenToken);
    const args: ExpressionNode[] = [];
    while (!atEnd() && tokens[idx].kind !== SyntaxKind.RightParenToken) {
      const arg = parseExpression();
      if (arg !== undefined) {
        args.push(arg);
        if (tokens[idx].kind === SyntaxKind.CommaToken) {
          idx++;
        }
      }
    }
    const end = consume(SyntaxKind.RightParenToken);
    return createFnCallExpression(fnName, args, {
      pos: fnName.pos,
      end: end.end,
    });
  }

  function parseParenExpression(): ParenExpression | undefined {
    const start = consume(SyntaxKind.LeftParenToken);
    const expr = parseExpression();
    if (expr === undefined) {
      return undefined;
    }
    const end = consume(SyntaxKind.RightParenToken);
    return createParenExpression(expr, { pos: start.pos, end: end.end });
  }

  function parseIdentifierNode(): IdentifierNode {
    const token = consume(SyntaxKind.IdentifierToken);
    const value = source.text.slice(token.pos, token.end);
    return createIdentifierNode(value, { pos: token.pos, end: token.end });
  }

  function parseNumberNode(): NumberNode {
    const token = consume(SyntaxKind.NumberToken);
    const value = source.text.slice(token.pos, token.end);
    return createNumberNode(parseInt(value, 10), { pos: token.pos, end: token.end });
  }

  function parseBooleanNode(): BooleanNode {
    let token: SyntaxToken<SyntaxKind.TrueKeyword | SyntaxKind.FalseKeyword>;
    switch (tokens[idx].kind) {
      case SyntaxKind.TrueKeyword:
        token = consume(SyntaxKind.TrueKeyword);
        break;
      case SyntaxKind.FalseKeyword:
        token = consume(SyntaxKind.FalseKeyword);
        break;
      default:
        throw new Error('parseBooleanNode should not have been called.');
    }
    return createBooleanNode(token.kind === SyntaxKind.TrueKeyword, { pos: token.pos, end: token.end });
  }

  return {
    parse() {
      while (!atEnd() && tokens[idx].kind !== SyntaxKind.EndOfFileToken) {
        const statement = parseStatement();
        if (statement !== undefined) {
          parsedSource.statements.push(statement);
        }
      }
      return parsedSource;
    },
  };
}
