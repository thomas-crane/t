import { SymbolType } from '../symbol';
import { Type } from '../type';
import { TextRange } from '../types';

/**
 * The base type of all types which represent some kind of syntax.
 */
export interface SyntaxNode extends TextRange {
  kind: SyntaxKind;
  flags: SyntaxNodeFlags;

  symbol?: SymbolType;
  type?: Type;
}

export const enum SyntaxNodeFlags {
  None = 0,
  HasErrors = 1 << 1,
  Synthetic = 1 << 2,
  HasSideEffects = 1 << 3,
}

/**
 * Types of syntax which can appear in a source file of t.
 */
export enum SyntaxKind {
  EndOfFileToken,
  UnknownToken,

  // keywords
  LetKeyword,
  MutKeyword,
  IfKeyword,
  ElseKeyword,
  FnKeyword,
  ReturnKeyword,
  LoopKeyword,
  StopKeyword,
  TrueKeyword,
  FalseKeyword,
  StructKeyword,
  NewKeyword,

  // type stuff
  TypeReference,
  ArrayType,
  OptionalType,

  // arithmetic
  PlusToken,
  MinusToken,
  StarToken,
  SlashToken,

  // comparison
  LessThan,
  GreaterThan,
  EqualTo,
  NotEqualTo,

  // logical
  LogicalAnd,
  LogicalOr,

  // misc
  EqualsToken,
  CommaToken,
  ColonToken,
  DotToken,
  QuestionToken,
  NumberToken,
  IdentifierToken,
  StringToken,

  // brackets
  LeftCurlyToken,
  RightCurlyToken,
  LeftParenToken,
  RightParenToken,
  LeftBracketToken,
  RightBracketToken,

  // expressions
  BinaryExpression,
  FnCallExpression,
  ParenExpression,
  ArrayExpression,
  StructMemberExpression,
  StructExpression,
  NilExpression,
  IndexExpression,
  MemberAccessExpression,

  // literals
  Identifier,
  Number,
  Boolean,
  String,

  // statements
  BlockStatement,
  IfStatement,
  AssignmentStatement,
  DeclarationStatement,
  FnParameter,
  FnDeclarationStatement,
  ReturnStatement,
  LoopStatement,
  StopStatement,
  ExpressionStatement,
  StructMember,
  StructDeclStatement,

  // top level
  SourceFile,
}
