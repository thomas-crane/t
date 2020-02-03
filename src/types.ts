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

  UnknownSymbol,
  DuplicateSymbol,

  IncompatibleOperandTypes,
  UnexpectedType,
  TypeNotCallable,
  WrongNumberOfArguments,
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

/**
 * The set of all symbol types.
 */
export type SymbolType
  = VariableSymbol
  | FunctionSymbol
  | ParameterSymbol
  ;

/**
 * Types of types.
 */
export enum TypeKind {
  Number,
  Boolean,
  Function,
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
 * The function type.
 */
export interface FunctionType extends TypeInfo {
  kind: TypeKind.Function;

  parameters: ParameterSymbol[];
  returnType: Type;
}

/**
 * The set of all types.
 */
export type Type
  = NumberType
  | BooleanType
  | FunctionType
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

  // type stuff
  NumKeyword,
  BoolKeyword,
  TypeReference,

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

  // brackets
  LeftCurlyToken,
  RightCurlyToken,
  LeftParenToken,
  RightParenToken,

  // expressions
  BinaryExpression,
  FnCallExpression,
  ParenExpression,

  // literals
  IdentifierLiteral,
  NumberLiteral,
  BooleanLiteral,

  // statements
  BlockStatement,
  IfStatement,
  AssignmentStatement,
  DeclarationStatement,
  FnDeclarationStatement,
  ReturnStatement,
  LoopStatement,
  StopStatement,
  ExpressionStatement,

  SourceFile,
}

/**
 * The base type of all types which represent some kind of syntax.
 */
interface SyntaxNode extends TextRange {
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
  | SyntaxKind.PlusToken
  | SyntaxKind.MinusToken
  | SyntaxKind.StarToken
  | SyntaxKind.SlashToken
  | SyntaxKind.EqualsToken
  | SyntaxKind.CommaToken
  | SyntaxKind.ColonToken
  | SyntaxKind.LeftCurlyToken
  | SyntaxKind.RightCurlyToken
  | SyntaxKind.LeftParenToken
  | SyntaxKind.RightParenToken
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
  | SyntaxKind.NumberLiteral
  | SyntaxKind.IdentifierLiteral
  ;

/**
 * A number literal expression.
 */
export interface NumberLiteral extends SyntaxNode {
  kind: SyntaxKind.NumberLiteral;
  value: number;
}

/**
 * An identifier literal expression.
 */
export interface IdentifierLiteral extends SyntaxNode {
  kind: SyntaxKind.IdentifierLiteral;
  value: string;
}

/**
 * A boolean literal expression.
 */
export interface BooleanLiteral extends SyntaxNode {
  kind: SyntaxKind.BooleanLiteral;
  value: boolean;
}

/**
 * An identifier used in a context where it is
 * referring to the name of a type.
 */
export interface TypeReference extends SyntaxNode {
  kind: SyntaxKind.TypeReference;
  name: IdentifierLiteral;
}

export type TypeNode
  = SyntaxToken<SyntaxKind.NumKeyword>
  | SyntaxToken<SyntaxKind.NumKeyword>
  | TypeReference
  ;

/**
 * A binary expression such as `10 + 20`
 */
export interface BinaryExpression extends SyntaxNode {
  kind: SyntaxKind.BinaryExpression;

  left: ExpressionNode;
  operator: BinaryOperator;
  right: ExpressionNode;
}
/**
 * The set of syntax tokens which are valid binary expression operators.
 */
export type BinaryOperator
  = SyntaxToken<SyntaxKind.PlusToken>
  | SyntaxToken<SyntaxKind.MinusToken>
  | SyntaxToken<SyntaxKind.StarToken>
  | SyntaxToken<SyntaxKind.SlashToken>
  | SyntaxToken<SyntaxKind.LessThan>
  | SyntaxToken<SyntaxKind.GreaterThan>
  | SyntaxToken<SyntaxKind.EqualTo>
  | SyntaxToken<SyntaxKind.NotEqualTo>
  | SyntaxToken<SyntaxKind.LogicalAnd>
  | SyntaxToken<SyntaxKind.LogicalOr>
  ;

/**
 * A function call expression.
 */
export interface FnCallExpression extends SyntaxNode {
  kind: SyntaxKind.FnCallExpression;

  fnName: IdentifierLiteral;
  args: ExpressionNode[];
}

/**
 * An expression which is wrapped in parentheses.
 */
export interface ParenExpression extends SyntaxNode {
  kind: SyntaxKind.ParenExpression;

  expr: ExpressionNode;
}

/**
 * The set of all syntax items which are expressions.
 */
export type ExpressionNode
  = NumberLiteral
  | IdentifierLiteral
  | BooleanLiteral
  | BinaryExpression
  | FnCallExpression
  | ParenExpression
  ;

/**
 * A list of statements.
 */
export interface BlockStatement extends SyntaxNode {
  kind: SyntaxKind.BlockStatement;

  statements: StatementNode[];
}

/**
 * An if statement with an optional else branch.
 */
export interface IfStatement extends SyntaxNode {
  kind: SyntaxKind.IfStatement;

  condition: ExpressionNode;
  body: BlockStatement;
  elseBody: BlockStatement | undefined;
}

/**
 * A variable assignment statement.
 */
export interface AssignmentStatement extends SyntaxNode {
  kind: SyntaxKind.AssignmentStatement;

  identifier: IdentifierLiteral;
  value: ExpressionNode;
}

/**
 * A variable declaration statement. This encompasses
 * both mutable and immutable assignments.
 */
export interface DeclarationStatement extends SyntaxNode {
  kind: SyntaxKind.DeclarationStatement;

  isConst: boolean;
  identifier: IdentifierLiteral;
  value: ExpressionNode;
}

/**
 * A function declaration statement.
 */
export interface FnDeclarationStatement extends SyntaxNode {
  kind: SyntaxKind.FnDeclarationStatement;

  fnName: IdentifierLiteral;
  params: IdentifierLiteral[];
  body: BlockStatement;
}

/**
 * A return statement.
 */
export interface ReturnStatement extends SyntaxNode {
  kind: SyntaxKind.ReturnStatement;

  value: ExpressionNode;
}

/**
 * A loop statement.
 */
export interface LoopStatement extends SyntaxNode {
  kind: SyntaxKind.LoopStatement;

  body: BlockStatement;
}

/**
 * A stop statement.
 */
export interface StopStatement extends SyntaxNode {
  kind: SyntaxKind.StopStatement;
}

/**
 * An expression statement.
 */
export interface ExpressionStatement extends SyntaxNode {
  kind: SyntaxKind.ExpressionStatement;

  expr: ExpressionNode;
}

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
