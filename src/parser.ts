import { ExpressionNode } from './ast/expr';
import { ArrayExpression, createArrayExpression } from './ast/expr/array-expr';
import { BinaryOperator, createBinaryExpression } from './ast/expr/binary-expr';
import { BooleanExpression, createBooleanExpression } from './ast/expr/boolean-expr';
import { createFnCallExpression } from './ast/expr/fn-call-expr';
import { createIdentifierExpression, IdentifierExpression } from './ast/expr/identifier-expr';
import { createIndexExpression } from './ast/expr/index-expr';
import { createMemberAccessExpression } from './ast/expr/member-access-expr';
import { createNumberExpression, NumberExpression } from './ast/expr/number-expr';
import { createParenExpression, ParenExpression } from './ast/expr/paren-expr';
import { createStringExpression, StringExpression } from './ast/expr/string-expr';
import { createStructExpression, createStructMemberExpression, StructExpression, StructMemberExpression } from './ast/expr/struct-expr';
import { createSourceFile, SourceFile } from './ast/source-file';
import { StatementNode } from './ast/stmt';
import { AssignmentStatement, createAssignmentStatement } from './ast/stmt/assignment-stmt';
import { BlockStatement, createBlockStatement } from './ast/stmt/block-stmt';
import { createDeclarationStatement, DeclarationStatement } from './ast/stmt/declaration-stmt';
import { createExpressionStatement, ExpressionStatement } from './ast/stmt/expression-stmt';
import { createFnDeclarationStatement, createFnParameter, FnDeclarationStatement, FnParameter } from './ast/stmt/fn-declaration-stmt';
import { createIfStatement, IfStatement } from './ast/stmt/if-stmt';
import { createLoopStatement, LoopStatement } from './ast/stmt/loop-stmt';
import { createReturnStatement, ReturnStatement } from './ast/stmt/return-stmt';
import { createStopStatement, StopStatement } from './ast/stmt/stop-stmt';
import { createStructDeclStatement, createStructMember, StructDeclStatement, StructMember } from './ast/stmt/struct-decl-stmt';
import { SyntaxKind, SyntaxNodeFlags } from './ast/syntax-node';
import { createToken, SyntaxToken, TokenSyntaxKind } from './ast/token';
import { TypeNode } from './ast/types';
import { createArrayTypeNode } from './ast/types/array-type-node';
import { createOptionalTypeNode } from './ast/types/optional-type-node';
import { createTypeReference, TypeReference } from './ast/types/type-reference';
import { DiagnosticType } from './diagnostic';
import { DiagnosticCode } from './diagnostic/diagnostic-code';
import { createDiagnosticError } from './diagnostic/diagnostic-error';
import { DiagnosticSource } from './diagnostic/diagnostic-source';
import { createLexer } from './lexer';
import { TextRange } from './types';

/**
 * An interface for turning some text into a source file node.
 */
export interface Parser {
  parse(): SourceFile;
}

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

  const diagnostics: DiagnosticType[] = [];

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
      diagnostics.push(createDiagnosticError(
        DiagnosticSource.Parser,
        DiagnosticCode.UnexpectedToken,
        `Unexpected token ${SyntaxKind[tokens[idx].kind]}. Expected ${SyntaxKind[expected]}`,
        { pos: tokens[idx].pos, end: tokens[idx].end },
      ));
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
    return parseType();
  }

  function parseType(): TypeNode {
    let type: TypeNode;
    switch (tokens[idx].kind) {
      case SyntaxKind.IdentifierToken:
        type = parseTypeReference();
        break;
      default:
        throw new Error('parseType should not have been called');
    }
    // check for an optional here so that arrays can
    // contain optional types.
    if (tokens[idx]?.kind === SyntaxKind.QuestionToken) {
      const question = consume(SyntaxKind.QuestionToken);
      type = createOptionalTypeNode(type, { pos: type.pos, end: question.end });
    }
    while (!atEnd()) {
      if (tokens[idx].kind === SyntaxKind.LeftBracketToken) {
        consume(SyntaxKind.LeftBracketToken);
        const closingBrace = consume(SyntaxKind.RightBracketToken);
        type = createArrayTypeNode(type, { pos: type.pos, end: closingBrace.end });
        // check again in case the array type itself is optional,
        if (tokens[idx]?.kind === SyntaxKind.QuestionToken as SyntaxKind) {
          const question = consume(SyntaxKind.QuestionToken);
          type = createOptionalTypeNode(type, { pos: type.pos, end: question.end });
        }
      } else {
        break;
      }
    }
    return type;
  }

  function parseTypeReference(): TypeReference {
    const typeName = parseIdentifierExpression();
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
      case SyntaxKind.StructKeyword:
        return parseStructDeclStatement();
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
    const identifier = parseIdentifierExpression();
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
    const name = parseIdentifierExpression();
    let typeNode: TypeNode | undefined;
    if (tokens[idx].kind === SyntaxKind.ColonToken) {
      typeNode = parseTypeAnnotation();
    }
    return createFnParameter(name, typeNode, { pos: name.pos, end: name.end });
  }

  function parseFnDeclarationStatement(): FnDeclarationStatement | undefined {
    const start = consume(SyntaxKind.FnKeyword);
    const fnName = parseIdentifierExpression();
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
    const identifier = parseIdentifierExpression();
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

  function parseStructDeclStatement(): StructDeclStatement {
    const start = consume(SyntaxKind.StructKeyword);
    const name = parseIdentifierExpression();
    consume(SyntaxKind.LeftCurlyToken);
    const members: StructDeclStatement['members'] = {};
    while (!atEnd() && tokens[idx].kind !== SyntaxKind.RightCurlyToken) {
      const member = parseStructMember();
      if (members[member.name.value] !== undefined) {
        diagnostics.push(createDiagnosticError(
          DiagnosticSource.Parser,
          DiagnosticCode.DuplicateSymbol,
          `Duplicate struct member "${member.name.value}"`,
          { pos: member.pos, end: member.end },
        ));
      } else {
        members[member.name.value] = member;
      }
      const nextTokenKind = tokens[idx]?.kind;
      if (nextTokenKind !== SyntaxKind.RightCurlyToken as SyntaxKind) {
        consume(SyntaxKind.CommaToken);
      }
    }
    const end = consume(SyntaxKind.RightCurlyToken);
    return createStructDeclStatement(
      name,
      members,
      { pos: start.pos, end: end.end },
    );
  }

  function parseStructMember(): StructMember {
    let isConst = true;
    let start: TextRange | undefined;
    let end: TextRange;
    if (tokens[idx].kind === SyntaxKind.MutKeyword) {
      start = consume(SyntaxKind.MutKeyword);
      isConst = false;
    }
    const name = parseIdentifierExpression();
    if (start === undefined) {
      start = name;
    }
    let typeNode: TypeNode | undefined;
    if (tokens[idx].kind === SyntaxKind.ColonToken) {
      typeNode = parseTypeAnnotation();
      end = typeNode;
    } else {
      end = name;
    }
    return createStructMember(
      isConst,
      name,
      typeNode,
      { pos: start!.pos, end: end.end },
    );
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
        left = createBinaryExpression(left, operator, right, { pos: left.pos, end: right.end });
      }
    }
    return left;
  }

  function parsePrimaryExpression(): ExpressionNode | undefined {
    let expr = parseTerminalExpression();
    while (!atEnd()) {
      if (expr === undefined) {
        return undefined;
      }
      switch (tokens[idx].kind) {
        case SyntaxKind.LeftBracketToken:
          expr = parseIndexExpression(expr);
          continue;
        case SyntaxKind.LeftParenToken:
          expr = parseFnCallExpression(expr);
          continue;
        case SyntaxKind.DotToken:
          expr = parseMemberAccessExpression(expr);
          continue;
        default:
          return expr;
      }
    }
  }

  function parseFnCallExpression(fn: ExpressionNode): ExpressionNode | undefined {
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
    return createFnCallExpression(fn, args, { pos: fn.pos, end: end.end });
  }

  function parseIndexExpression(target: ExpressionNode): ExpressionNode | undefined {
    consume(SyntaxKind.LeftBracketToken);
    const index = parseExpression();
    if (index === undefined) {
      return undefined;
    }
    const end = consume(SyntaxKind.RightBracketToken);
    return createIndexExpression(target, index, { pos: target.pos, end: end.end });
  }

  function parseMemberAccessExpression(target: ExpressionNode): ExpressionNode | undefined {
    consume(SyntaxKind.DotToken);
    const member = parseIdentifierExpression();
    return createMemberAccessExpression(target, member, { pos: target.pos, end: member.end });
  }

  function parseTerminalExpression(): ExpressionNode | undefined {
    while (!atEnd()) {
      switch (tokens[idx].kind) {
        case SyntaxKind.LeftParenToken:
          return parseParenExpression();
        case SyntaxKind.LeftBracketToken:
          return parseArrayExpression();
        case SyntaxKind.NewKeyword:
          return parseStructExpression();
        case SyntaxKind.IdentifierToken:
          return parseIdentifierExpression();
        case SyntaxKind.NumberToken:
          return parseNumberExpression();
        case SyntaxKind.TrueKeyword:
        case SyntaxKind.FalseKeyword:
          return parseBooleanExpression();
        case SyntaxKind.StringToken:
          return parseStringExpression();
        default:
          diagnostics.push(createDiagnosticError(
            DiagnosticSource.Parser,
            DiagnosticCode.UnexpectedToken,
            'Expected an expression.',
            { pos: tokens[idx].pos, end: tokens[idx].end },
          ));
          idx++;
      }
    }
    return undefined;
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

  function parseArrayExpression(): ArrayExpression | undefined {
    const start = consume(SyntaxKind.LeftBracketToken);
    const items: ExpressionNode[] = [];
    while (!atEnd() && tokens[idx].kind !== SyntaxKind.RightBracketToken) {
      const item = parseExpression();
      if (item === undefined) {
        return undefined;
      }
      items.push(item);
      const nextTokenKind = tokens[idx]?.kind;
      if (nextTokenKind !== SyntaxKind.RightBracketToken as SyntaxKind) {
        consume(SyntaxKind.CommaToken);
      }
    }
    const end = consume(SyntaxKind.RightBracketToken);
    return createArrayExpression(items, { pos: start.pos, end: end.end });
  }

  function parseIdentifierExpression(): IdentifierExpression {
    const token = consume(SyntaxKind.IdentifierToken);
    const value = source.text.slice(token.pos, token.end);
    return createIdentifierExpression(value, { pos: token.pos, end: token.end });
  }

  function parseNumberExpression(): NumberExpression {
    const token = consume(SyntaxKind.NumberToken);
    const value = source.text.slice(token.pos, token.end);
    return createNumberExpression(parseInt(value, 10), { pos: token.pos, end: token.end });
  }

  function parseBooleanExpression(): BooleanExpression {
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
    return createBooleanExpression(token.kind === SyntaxKind.TrueKeyword, { pos: token.pos, end: token.end });
  }

  function parseStringExpression(): StringExpression {
    const token = consume(SyntaxKind.StringToken);
    const value = source.text.slice(token.pos + 1, token.end - 1); // cut off quotemarks.
    return createStringExpression(value, { pos: token.pos, end: token.end });
  }

  function parseStructExpression(): StructExpression | undefined {
    const start = consume(SyntaxKind.NewKeyword);
    const name = parseIdentifierExpression();
    consume(SyntaxKind.LeftCurlyToken);
    const members: StructExpression['members'] = {};
    while (!atEnd() && tokens[idx].kind !== SyntaxKind.RightCurlyToken) {
      const member = parseStructMemberExpression();
      if (member === undefined) {
        return undefined;
      }
      if (members[member.name.value] !== undefined) {
        diagnostics.push(createDiagnosticError(
          DiagnosticSource.Parser,
          DiagnosticCode.DuplicateSymbol,
          `Duplicate struct member "${member.name.value}"`,
          { pos: member.pos, end: member.end },
        ));
      } else {
        members[member.name.value] = member;
      }
      const nextTokenKind = tokens[idx]?.kind;
      if (nextTokenKind !== SyntaxKind.RightCurlyToken as SyntaxKind) {
        consume(SyntaxKind.CommaToken);
      }
    }
    const end = consume(SyntaxKind.RightCurlyToken);
    return createStructExpression(
      name,
      members,
      { pos: start.pos, end: end.end },
    );
  }

  function parseStructMemberExpression(): StructMemberExpression | undefined {
    const name = parseIdentifierExpression();
    consume(SyntaxKind.ColonToken);
    const value = parseExpression();
    if (value === undefined) {
      return undefined;
    }
    return createStructMemberExpression(
      name,
      value,
      { pos: name.pos, end: value.end },
    );
  }

  return {
    parse() {
      while (!atEnd() && tokens[idx].kind !== SyntaxKind.EndOfFileToken) {
        const statement = parseStatement();
        if (statement !== undefined) {
          parsedSource.statements.push(statement);
        }
      }
      parsedSource.diagnostics.push(...diagnostics);
      return parsedSource;
    },
  };
}
