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
  /**
   * This node has no flags.
   */
  None = 0,
  /**
   * This node has some diagnostics associated with it.
   */
  HasErrors = 1 << 1,
  /**
   * This node was inserted by the compiler.
   */
  Synthetic = 1 << 2,
  /**
   * This node has side effects.
   */
  HasSideEffects = 1 << 3,
  /**
   * The current scope should be retained
   * before this node is checked.
   */
  RetainScope = 1 << 4,
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
  ExclamationToken,
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
  FnCallExpression,
  ParenExpression,
  ArrayExpression,
  StructMemberExpression,
  StructExpression,

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
  ExpressionStatement,
  StructMember,
  StructDeclStatement,
  GotoStatement,

  // top level
  SourceFile,
}
