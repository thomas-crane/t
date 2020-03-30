import { Writable } from 'stream';
import { ArrayExpression } from './ast/expr/array-expr';
import { BinaryExpression } from './ast/expr/binary-expr';
import { BooleanExpression } from './ast/expr/boolean-expr';
import { FnCallExpression } from './ast/expr/fn-call-expr';
import { IdentifierExpression } from './ast/expr/identifier-expr';
import { IndexExpression } from './ast/expr/index-expr';
import { MemberAccessExpression } from './ast/expr/member-access-expr';
import { NumberExpression } from './ast/expr/number-expr';
import { ParenExpression } from './ast/expr/paren-expr';
import { StringExpression } from './ast/expr/string-expr';
import { StructExpression } from './ast/expr/struct-expr';
import { AssignmentStatement } from './ast/stmt/assignment-stmt';
import { BlockStatement } from './ast/stmt/block-stmt';
import { DeclarationStatement } from './ast/stmt/declaration-stmt';
import { ExpressionStatement } from './ast/stmt/expression-stmt';
import { FnDeclarationStatement } from './ast/stmt/fn-declaration-stmt';
import { IfStatement } from './ast/stmt/if-stmt';
import { LoopStatement } from './ast/stmt/loop-stmt';
import { ReturnStatement } from './ast/stmt/return-stmt';
import { StopStatement } from './ast/stmt/stop-stmt';
import { StructDeclStatement } from './ast/stmt/struct-decl-stmt';
import { ArrayTypeNode } from './ast/types/array-type-node';
import { OptionalTypeNode } from './ast/types/optional-type-node';
import { TypeReference } from './ast/types/type-reference';

/**
 * Types of diagnostics which can be generated.
 */
export enum DiagnosticKind {
  Message,
  Warning,
  Error,
  Hint,
}

/**
 * Sources of diagnostic messages.
 */
export const enum DiagnosticSource {
  Lexer = 0,
  Parser = 1 << 1,
  Binder = 1 << 2,
  Checker = 1 << 3,
}

/**
 * Unique codes for each diagnostic message which can be generated.
 */
export enum DiagnosticCode {
  UnknownToken,
  UnexpectedToken,
  UnterminatedStringLiteral,

  UnknownSymbol,
  DuplicateSymbol,

  IncompatibleOperandTypes,
  UnexpectedType,
  CannotInferType,
  TypeNotCallable,
  TypeNotIndexable,
  WrongNumberOfArguments,

  UnknownMember,
  UninitialisedMember,
  RecursiveStruct,
}

/**
 * The base type of all types which represent some kind of diagnostic.
 */
interface Diagnostic {
  kind: DiagnosticKind;
  source: DiagnosticSource;
  code: DiagnosticCode;
}

/**
 * A diagnostic message, typically just useful information
 * that is not an error or a hint.
 */
export interface DiagnosticMessage extends Diagnostic, TextRange {
  kind: DiagnosticKind.Message;
  message: string;
}

/**
 * A diagnostic message about something that is not a problem
 * now but could become one in the future.
 */
export interface DiagnosticWarning extends Diagnostic, TextRange {
  kind: DiagnosticKind.Warning;
  warning: string;
}

/**
 * A diagnostic message about something which has gone wrong
 * and from which the system cannot continue.
 */
export interface DiagnosticError extends Diagnostic, TextRange {
  kind: DiagnosticKind.Error;
  error: string;
}

/**
 * A diagnostic message suggesting a change or action to take.
 */
export interface DiagnosticHint extends Diagnostic, TextRange {
  kind: DiagnosticKind.Hint;
  hint: string;
}

/**
 * The set of all diagnostic types.
 */
export type DiagnosticType
  = DiagnosticMessage
  | DiagnosticWarning
  | DiagnosticError
  | DiagnosticHint
  ;

/**
 * Types of symbols which can appear in the AST.
 */
export enum SymbolKind {
  Variable,
  Function,
  Parameter,
  Struct,
  StructMember,
}

/**
 * The base type of all types which represent some kind of symbol.
 */
interface Symbol {
  kind: SymbolKind;
  name: string;
  firstMention: SyntaxNode;
  references: SyntaxNode[];
}

/**
 * A symbol which refers to a variable.
 */
export interface VariableSymbol extends Symbol {
  kind: SymbolKind.Variable;
  isConst: boolean;
}

/**
 * A symbol which refers to a function.
 */
export interface FunctionSymbol extends Symbol {
  kind: SymbolKind.Function;
  parameters: ParameterSymbol[];
}

/**
 * A symbol which refers to the parameter of a function.
 */
export interface ParameterSymbol extends Symbol {
  kind: SymbolKind.Parameter;
}

export interface StructSymbol extends Symbol {
  kind: SymbolKind.Struct;

  members: Record<string, StructMemberSymbol>;
}

export interface StructMemberSymbol extends Symbol {
  kind: SymbolKind.StructMember;

  isConst: boolean;
  struct: StructSymbol;
}

/**
 * The set of all symbol types.
 */
export type SymbolType
  = VariableSymbol
  | FunctionSymbol
  | ParameterSymbol
  | StructSymbol
  | StructMemberSymbol
  ;

/**
 * Types of types.
 */
export enum TypeKind {
  Number,
  Boolean,
  String,
  Array,
  Function,
  Struct,
  Optional,
  Nil,
}

/**
 * The base type of all specific forms of types.
 */
interface TypeInfo {
  kind: TypeKind;
  name: string;
}

/**
 * The number type.
 */
export interface NumberType extends TypeInfo {
  kind: TypeKind.Number;
}

/**
 * The boolean type.
 */
export interface BooleanType extends TypeInfo {
  kind: TypeKind.Boolean;
}

/**
 * The string type.
 */
export interface StringType extends TypeInfo {
  kind: TypeKind.String;
}

/**
 * The array type.
 */
export interface ArrayType extends TypeInfo {
  kind: TypeKind.Array;

  itemType: Type;
}

/**
 * The function type.
 */
export interface FunctionType extends TypeInfo {
  kind: TypeKind.Function;

  parameters: ParameterSymbol[];
  returnType: Type | undefined;
}

export interface StructType extends TypeInfo {
  kind: TypeKind.Struct;

  members: Record<string, Type | undefined>;
}

export interface OptionalType extends TypeInfo {
  kind: TypeKind.Optional;

  valueType: Type;
}

export interface NilType extends TypeInfo {
  kind: TypeKind.Nil;
}

/**
 * The set of all types.
 */
export type Type
  = NumberType
  | BooleanType
  | StringType
  | FunctionType
  | ArrayType
  | StructType
  | OptionalType
  | NilType
  ;

/**
 * Types of matches which can occur when trying to
 * convert `fromType` into `toType`.
 */
export enum TypeMatch {
  /**
   * `fromType` does not match `toType` in any way.
   */
  NoMatch,
  /**
   * `fromType` is an exact match of `toType`.
   */
  Equal,
  /**
   * `fromType` is a subtype of `toType`.
   */
  SubEqual,
  /**
   * `fromType` is a supertype of `toType`.
   */
  SuperEqual,
}

/**
 * Types of block exits.
 */
export enum BlockExitKind {
  Return,
  Jump,
  Stop,
  End,
}

/**
 * The base type of all block exit types.
 */
interface BlockExitType {
  kind: BlockExitKind;
}

/**
 * A block exit which returns from the block.
 */
export interface ReturnBlockExit extends BlockExitType {
  kind: BlockExitKind.Return;

  returnNode: ReturnStatement;
}

/**
 * A block exit which is just the end of the block.
 */
export interface EndBlockExit extends BlockExitType {
  kind: BlockExitKind.End;
}

/**
 * A block exit which is a stop statement.
 */
export interface StopBlockExit extends BlockExitType {
  kind: BlockExitKind.Stop;

  stopNode: StopStatement;
}

/**
 * A block exit which jumps into another block.
 */
export interface JumpBlockExit extends BlockExitType {
  kind: BlockExitKind.Jump;

  target: BlockStatement;
}

/**
 * The set of all block exit types.
 */
export type BlockExit
  = ReturnBlockExit
  | EndBlockExit
  | JumpBlockExit
  | StopBlockExit
  ;

/**
 * A slice of text.
 */
export interface TextRange {
  pos: number;
  end: number;
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
  NumKeyword,
  BoolKeyword,
  StrKeyword,
  NilKeyword,
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

  SourceFile,
}

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
 * A token. This can include single characters, operators and keywords.
 */
export interface SyntaxToken<TokenKind extends TokenSyntaxKind> extends SyntaxNode {
  kind: TokenKind;
}
export type TokenSyntaxKind
  = SyntaxKind.EndOfFileToken
  | SyntaxKind.UnknownToken
  | SyntaxKind.NumKeyword
  | SyntaxKind.BoolKeyword
  | SyntaxKind.StrKeyword
  | SyntaxKind.StructKeyword
  | SyntaxKind.NilKeyword
  | SyntaxKind.PlusToken
  | SyntaxKind.MinusToken
  | SyntaxKind.StarToken
  | SyntaxKind.SlashToken
  | SyntaxKind.EqualsToken
  | SyntaxKind.CommaToken
  | SyntaxKind.ColonToken
  | SyntaxKind.DotToken
  | SyntaxKind.QuestionToken
  | SyntaxKind.LeftCurlyToken
  | SyntaxKind.RightCurlyToken
  | SyntaxKind.LeftParenToken
  | SyntaxKind.RightParenToken
  | SyntaxKind.LeftBracketToken
  | SyntaxKind.RightBracketToken
  | SyntaxKind.LessThan
  | SyntaxKind.GreaterThan
  | SyntaxKind.EqualTo
  | SyntaxKind.NotEqualTo
  | SyntaxKind.LogicalAnd
  | SyntaxKind.LogicalOr
  | SyntaxKind.LetKeyword
  | SyntaxKind.MutKeyword
  | SyntaxKind.IfKeyword
  | SyntaxKind.ElseKeyword
  | SyntaxKind.FnKeyword
  | SyntaxKind.ReturnKeyword
  | SyntaxKind.LoopKeyword
  | SyntaxKind.StopKeyword
  | SyntaxKind.TrueKeyword
  | SyntaxKind.FalseKeyword
  | SyntaxKind.NumberToken
  | SyntaxKind.IdentifierToken
  | SyntaxKind.StringToken
  | SyntaxKind.StructKeyword
  | SyntaxKind.NewKeyword
  ;

export type TypeNode
  = SyntaxToken<SyntaxKind.NumKeyword>
  | SyntaxToken<SyntaxKind.BoolKeyword>
  | SyntaxToken<SyntaxKind.StrKeyword>
  | SyntaxToken<SyntaxKind.NilKeyword>
  | TypeReference
  | ArrayTypeNode
  | OptionalTypeNode
  ;

/**
 * The set of all syntax items which are expressions.
 */
export type ExpressionNode
  = NumberExpression
  | IdentifierExpression
  | BooleanExpression
  | StringExpression
  | BinaryExpression
  | FnCallExpression
  | ParenExpression
  | ArrayExpression
  | StructExpression
  | IndexExpression
  | MemberAccessExpression
  ;

/**
 * The set of all syntax items which are statements.
 */
export type StatementNode
  = BlockStatement
  | IfStatement
  | AssignmentStatement
  | DeclarationStatement
  | FnDeclarationStatement
  | ReturnStatement
  | LoopStatement
  | StopStatement
  | ExpressionStatement
  | StructDeclStatement
  ;

/**
 * A top level node which contains the list of statements in a program,
 * and some information about the file which the statements came from.
 */
export interface SourceFile extends SyntaxNode {
  kind: SyntaxKind.SourceFile;
  statements: StatementNode[];
  text: string;
  fileName: string;

  diagnostics: DiagnosticType[];
}

/**
 * The set of all syntax item types.
 */
export type Node
  = StatementNode
  | ExpressionNode
  | TypeNode
  | SourceFile
  ;

/**
 * An interface for turning some text into a stream of tokens.
 */
export interface Lexer {
  nextToken(): SyntaxToken<TokenSyntaxKind>;
  getDiagnostics(): DiagnosticType[];
}

/**
 * An interface for turning some text into a source file node.
 */
export interface Parser {
  parse(): SourceFile;
}

/**
 * An interface for taking an existing source file and analysing
 * the control flow paths in the code. Information which is
 * found is added to some nodes of the AST.
 */
export interface ControlFlowAnalyser {
  analyse(source: SourceFile): void;
}

/**
 * An interface for taking an existing source file node and filling
 * out some of the semantic information such as symbols.
 */
export interface Binder {
  bind(source: SourceFile): void;
}

/**
 * An interface for taking an existing source file and annotating it
 * with type information. The correctness of the types is checked
 * at the same time.
 */
export interface TypeChecker {
  check(source: SourceFile): void;
}

/**
 * Options which can change the way a @see Reporter
 * will report diagnostics.
 */
export interface ReporterOptions {
  color: boolean;
  output: Writable;
}

/**
 * An interface for reporting the
 * diagnostics from a given source file.
 */
export interface Reporter {
  report(source: SourceFile): void;
}
