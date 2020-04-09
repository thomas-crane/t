import { ExpressionNode } from './ast/expr';
import { ArrayExpression, createArrayExpression } from './ast/expr/array-expr';
import { BooleanExpression, createBooleanExpression } from './ast/expr/boolean-expr';
import { createFnCallExpression, FnCallFlags } from './ast/expr/fn-call-expr';
import { createIdentifierExpression, IdentifierExpression } from './ast/expr/identifier-expr';
import { createNumberExpression, NumberExpression } from './ast/expr/number-expr';
import { createParenExpression, ParenExpression } from './ast/expr/paren-expr';
import { createStringExpression, StringExpression } from './ast/expr/string-expr';
import { createStructExpression, createStructMemberExpression, StructExpression, StructMemberExpression } from './ast/expr/struct-expr';
import { createSourceFile, SourceFile, TopLevelStatement } from './ast/source-file';
import { StatementNode } from './ast/stmt';
import { AssignmentStatement, createAssignmentStatement } from './ast/stmt/assignment-stmt';
import { BlockEnd, BlockEndKind, createBlockEnd } from './ast/stmt/block-end';
import { BlockStatement, createBlockStatement } from './ast/stmt/block-stmt';
import { createDeclarationStatement, DeclarationStatement } from './ast/stmt/declaration-stmt';
import { createExpressionStatement, ExpressionStatement } from './ast/stmt/expression-stmt';
import { createFnDeclarationStatement, createFnParameter, FnDeclarationStatement, FnParameter } from './ast/stmt/fn-declaration-stmt';
import { createGotoStatement } from './ast/stmt/goto-stmt';
import { createIfStatement, IfStatement } from './ast/stmt/if-stmt';
import { createLoopStatement, LoopStatement } from './ast/stmt/loop-stmt';
import { createReturnStatement, ReturnStatement } from './ast/stmt/return-stmt';
import { createStructDeclStatement, createStructMember, StructDeclStatement, StructMember } from './ast/stmt/struct-decl-stmt';
import { SyntaxKind, SyntaxNodeFlags } from './ast/syntax-node';
import { BinaryOperator, createToken, SyntaxToken, TokenSyntaxKind, UnaryOperator } from './ast/token';
import { TypeNode } from './ast/types';
import { createArrayTypeNode } from './ast/types/array-type-node';
import { createOptionalTypeNode } from './ast/types/optional-type-node';
import { createTypeReference, TypeReference } from './ast/types/type-reference';
import { getAllEnds, getDeadEnds } from './common/block-utils';
import { binaryOpName, unaryOpName } from './common/op-names';
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
  /**
   * The stack of blocks currently being parsed.
   */
  const blocks: BlockStatement[] = [];
  /**
   * The block at the top of the stack.
   */
  function currentBlock(): BlockStatement {
    return blocks[blocks.length - 1];
  }

  function replaceBlock(end: TextRange) {
    currentBlock().end = end.end;
    const newBlock = createBlockStatement();

    // since new block is adjacent to the current one,
    // we need to copy the parent of the current block.
    const currentTable = currentBlock().symbolTable;
    newBlock.symbolTable.parent = currentTable;

    newBlock.flags |= SyntaxNodeFlags.Synthetic;
    newBlock.pos = end.end;
    blocks.pop();
    blocks.push(newBlock);
  }

  /**
   * The stack of loop statements currently being parsed.
   */
  let loopCounter = 0;

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

  function isUnaryOperator(kind: SyntaxKind): boolean {
    switch (kind) {
      case SyntaxKind.ExclamationToken:
      case SyntaxKind.PlusToken:
      case SyntaxKind.MinusToken:
        return true;
      default:
        return false;
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

  function parseTopLevelStatement(): TopLevelStatement | undefined {
    switch (tokens[idx].kind) {
      case SyntaxKind.FnKeyword:
        return parseFnDeclarationStatement();
      case SyntaxKind.StructKeyword:
        return parseStructDeclStatement();
      default:
        const statement = parseStatement();
        if (statement !== undefined) {
          diagnostics.push(createDiagnosticError(
            DiagnosticSource.Parser,
            DiagnosticCode.UnexpectedToken,
            'Expected a top level statement.',
            { pos: statement.pos, end: statement.end },
          ));
        }
    }
  }

  function parseStatement(): StatementNode | undefined {
    switch (tokens[idx].kind) {
      case SyntaxKind.LeftCurlyToken:
        return parseBlockStatement();
      case SyntaxKind.LetKeyword:
      case SyntaxKind.MutKeyword:
        return parseDeclarationStatement();
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
    // create a new block and add it to the stack.
    const block = createBlockStatement();
    blocks.push(block);

    // set the start pos.
    const start = consume(SyntaxKind.LeftCurlyToken);
    block.pos = start.pos;

    let hasExit = false;

    while (!atEnd() && tokens[idx].kind !== SyntaxKind.RightCurlyToken) {
      const statement = parseStatement();
      if (statement === undefined) {
        continue;
      }
      // if there is already an exit for this block,
      // the statements go in the `afterExit` list.
      if (hasExit) {
        currentBlock().afterExit.push(statement);
      } else {
        // otherwise we should check if we can set the
        // exit, or just put the statement in the list.
        switch (statement.kind) {
          case SyntaxKind.ReturnStatement:
          case SyntaxKind.GotoStatement:
          case SyntaxKind.BlockEnd:
            // any code after a `return` or `stop` statement
            // is unreachable and does not require a new block.
            currentBlock().exit = statement;
            hasExit = true;
            break;
          case SyntaxKind.BlockStatement: {
            // if the statement was another block statement, jump into that one.
            const intoBlock = createGotoStatement(statement);
            intoBlock.flags |= SyntaxNodeFlags.Synthetic;
            currentBlock().exit = intoBlock;

            // set the parent scope of the block to this block.
            statement.symbolTable.parent = currentBlock().symbolTable;

            // if the block we jumped into has any dead ends,
            // those need to fall through into a new block.
            const deadEnds = getDeadEnds(statement);
            if (deadEnds.length > 0) {
              replaceBlock(statement);
              for (const deadEnd of deadEnds) {
                // jump from the dead end into the new block.
                const exitBlock = createGotoStatement(currentBlock());
                exitBlock.flags |= SyntaxNodeFlags.Synthetic;
                deadEnd.exit = exitBlock;
              }
            } else {
              hasExit = true;
            }
            break;
          }
          case SyntaxKind.LoopStatement: {
            // jump into the loop.
            const intoLoop = createGotoStatement(statement.body);
            intoLoop.flags |= SyntaxNodeFlags.Synthetic;
            currentBlock().exit = intoLoop;
            // set the parent scope.
            statement.body.symbolTable.parent = currentBlock().symbolTable;

            const endList = getAllEnds(statement.body);
            const stopEnds = endList.filter((b) => (b.exit as BlockEnd).endKind === BlockEndKind.Stop);
            const deadEnds = endList.filter((b) => (b.exit as BlockEnd).endKind === BlockEndKind.End);
            // if there are any dead ends, they simply jump back to the
            // start of the loop.
            if (deadEnds.length > 0) {
              for (const deadEnd of deadEnds) {
                // jump from the dead end back into the loop.
                const exitBlock = createGotoStatement(statement.body);
                exitBlock.flags |= SyntaxNodeFlags.Synthetic;
                deadEnd.exit = exitBlock;
              }
            }
            // if there are stop statements, they need to break out
            // into an adjacent block.
            if (stopEnds.length > 0) {
              // replace the current block with a new one.
              replaceBlock(statement);

              for (const stopEnd of stopEnds) {
                // jump into the new block.
                const gotoExit = createGotoStatement(currentBlock());
                gotoExit.flags |= SyntaxNodeFlags.Synthetic;
                stopEnd.exit = gotoExit;
              }
            }
            // if there are no stops and some dead
            // ends, this could be an infinite loop.
            if (stopEnds.length === 0 && deadEnds.length > 0) {
              hasExit = true;
            }
            break;
          }
          case SyntaxKind.IfStatement: {
            currentBlock().exit = statement;
            // set the scope parents.
            statement.body.symbolTable.parent = currentBlock().symbolTable;
            statement.elseBody.symbolTable.parent = currentBlock().symbolTable;

            // replace any dead ends in the if statement.
            const deadEnds = [...getDeadEnds(statement.body), ...getDeadEnds(statement.elseBody)];
            if (deadEnds.length > 0) {
              // replace the current block with a new one.
              replaceBlock(statement);

              for (const deadEnd of deadEnds) {
                // jump into the new block.
                const gotoExit = createGotoStatement(currentBlock());
                gotoExit.flags |= SyntaxNodeFlags.Synthetic;
                deadEnd.exit = gotoExit;
              }
            } else {
              // if there are no dead ends in the if statement,
              // any code after it is unreachable.
              hasExit = true;
            }
            break;
          }
          default: {
            currentBlock().statements.push(statement);
          }
        }
      }
    }
    // set the end pos.
    if (!atEnd()) {
      const end = consume(SyntaxKind.RightCurlyToken);
      block.end = end.end;
    } else {
      block.end = idx;
    }

    // remove this block from the stack.
    blocks.pop();
    return block;
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
    let elseBody: BlockStatement;
    if (tokens[idx].kind === SyntaxKind.ElseKeyword) {
      consume(SyntaxKind.ElseKeyword);
      elseBody = parseBlockStatement();
    } else {
      // if there is no else body create a
      // synthetic, empty block.
      elseBody = createBlockStatement();
      elseBody.flags = SyntaxNodeFlags.Synthetic;
    }
    return createIfStatement(condition, body, elseBody, {
      pos: start.pos,
      end: elseBody.end,
    });
  }

  function parseLoopStatement(): LoopStatement {
    const start = consume(SyntaxKind.LoopKeyword);
    // make sure the loop counter is incremented
    // before we parse the body so that the exit
    // can be constructed properly.
    loopCounter++;
    const body = parseBlockStatement();
    loopCounter--;
    return createLoopStatement(body, { pos: start.pos, end: body.end });
  }

  function parseStopStatement(): BlockEnd | undefined {
    const token = consume(SyntaxKind.StopKeyword);
    if (loopCounter === 0) {
      diagnostics.push(createDiagnosticError(
        DiagnosticSource.Parser,
        DiagnosticCode.UnexpectedToken,
        'stop statements can only appear within loops.',
        { pos: token.pos, end: token.end },
      ));
      return undefined;
    }
    // add an end for now, this will be replaced with a goto into the current loop block.
    return createBlockEnd(BlockEndKind.Stop, { pos: token.pos, end: token.end });
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
    let left = parseUnaryExpression();
    if (left === undefined) {
      return undefined;
    }
    while (!atEnd()) {
      const precedence = getBinaryPrecedence(tokens[idx].kind);
      if (precedence === 0 || precedence <= parentPrecedence) {
        break;
      } else {
        const operator = consume(tokens[idx].kind);
        const right = parseBinaryExpression(precedence);
        if (right === undefined) {
          return undefined;
        }

        // turn the operator into an identifier.
        const opName = createIdentifierExpression(
          binaryOpName[operator.kind as BinaryOperator],
          { pos: operator.pos, end: operator.end },
        );
        opName.flags |= SyntaxNodeFlags.Synthetic;

        // desugar into an fn call
        left = createFnCallExpression(
          opName,
          [left, right],
          FnCallFlags.Operator | FnCallFlags.BinaryOp,
          { pos: left.pos, end: right.end },
        );
      }
    }
    return left;
  }

  function parseUnaryExpression(): ExpressionNode | undefined {
    if (isUnaryOperator(tokens[idx].kind)) {
      const operator = consume(tokens[idx].kind);
      const operand = parseUnaryExpression();
      if (operand === undefined) {
        return undefined;
      }
      // turn the operator into an identifier.
      const opName = createIdentifierExpression(
        unaryOpName[operator.kind as UnaryOperator],
        { pos: operator.pos, end: operator.end },
      );

      // desugar into an fn call
      return createFnCallExpression(
        opName,
        [operand],
        FnCallFlags.Operator | FnCallFlags.UnaryOp,
      );
    } else {
      return parsePrimaryExpression();
    }
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
    return createFnCallExpression(
      fn,
      args,
      FnCallFlags.None,
      { pos: fn.pos, end: end.end },
    );
  }

  function parseIndexExpression(target: ExpressionNode): ExpressionNode | undefined {
    consume(SyntaxKind.LeftBracketToken);
    const index = parseExpression();
    if (index === undefined) {
      return undefined;
    }
    const end = consume(SyntaxKind.RightBracketToken);
    // desugar into an index fn call.
    return createFnCallExpression(
      target,
      [index],
      FnCallFlags.Index,
      { pos: target.pos, end: end.end },
    );
  }

  function parseMemberAccessExpression(target: ExpressionNode): ExpressionNode | undefined {
    consume(SyntaxKind.DotToken);
    const member = parseIdentifierExpression();
    // desugar into a field access fn call.
    return createFnCallExpression(
      target,
      [member],
      FnCallFlags.FieldAccess,
      { pos: target.pos, end: member.end },
    );
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
        const statement = parseTopLevelStatement();
        if (statement !== undefined) {
          parsedSource.statements.push(statement);
        }
      }
      parsedSource.diagnostics.push(...diagnostics);
      return parsedSource;
    },
  };
}
