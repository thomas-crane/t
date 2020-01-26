import {
  createAssignmentStatement,
  createBinaryExpression,
  createBlockStatement,
  createDeclarationStatement,
  createExpressionStatement,
  createFnCallExpression,
  createFnDeclarationStatement,
  createIfStatement,
  createLoopStatement,
  createReturnStatement,
  createSourceFile,
  createToken,
} from './factory';
import { createLexer } from './lexer';
import {
  AssignmentStatement,
  BinaryOperator,
  BlockStatement,
  DeclarationStatement,
  DiagnosticCode,
  DiagnosticKind,
  DiagnosticSource,
  ExpressionNode,
  ExpressionStatement,
  FnCallExpression,
  FnDeclarationStatement,
  IdentifierLiteral,
  IfStatement,
  LoopStatement,
  Parser,
  ReturnStatement,
  SourceFile,
  StatementNode,
  SyntaxKind,
  SyntaxNodeFlags,
  SyntaxToken,
  TokenSyntaxKind,
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
      case SyntaxKind.ReturnKeyword:
        return parseReturnStatement();
      case SyntaxKind.IdentifierLiteral:
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
    const identifier = consume(SyntaxKind.IdentifierLiteral) as IdentifierLiteral;
    consume(SyntaxKind.EqualsToken);
    const value = parseExpression();
    if (!value) {
      return undefined;
    }
    const isConst = declKeyword.kind === SyntaxKind.LetKeyword;
    return createDeclarationStatement(isConst, identifier, value, {
      pos: declKeyword.pos,
      end: value.end,
    });
  }

  function parseFnDeclarationStatement(): FnDeclarationStatement | undefined {
    const start = consume(SyntaxKind.FnKeyword);
    const fnName = consume(SyntaxKind.IdentifierLiteral) as IdentifierLiteral;
    consume(SyntaxKind.ColonToken);
    // params
    const params: IdentifierLiteral[] = [];
    while (!atEnd() && tokens[idx].kind !== SyntaxKind.LeftCurlyToken) {
      const param = consume(SyntaxKind.IdentifierLiteral) as IdentifierLiteral;
      params.push(param);
      if (tokens[idx].kind === SyntaxKind.CommaToken) {
        idx++;
      }
    }
    const body = parseBlockStatement();
    return createFnDeclarationStatement(fnName, params, body, {
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

  function parseReturnStatement(): ReturnStatement | undefined {
    const start = consume(SyntaxKind.ReturnKeyword);
    const value = parseExpression();
    if (value === undefined) {
      return undefined;
    }
    return createReturnStatement(value, { pos: start.pos, end: value.end });
  }

  function parseAssignmentStatement(): AssignmentStatement | undefined {
    const identifier = consume(SyntaxKind.IdentifierLiteral) as IdentifierLiteral;
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
        case SyntaxKind.IdentifierLiteral: {
          if (tokens[idx + 1] && tokens[idx + 1].kind === SyntaxKind.LeftParenToken) {
            return parseFnCallExpression();
          } else {
            const expr = consume(SyntaxKind.IdentifierLiteral) as ExpressionNode;
            return expr;
          }
        }
        case SyntaxKind.NumberLiteral: {
          const expr = consume(SyntaxKind.NumberLiteral) as ExpressionNode;
          return expr;
        }
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
    const fnName = consume(SyntaxKind.IdentifierLiteral) as IdentifierLiteral;
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
