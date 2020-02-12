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
  WrongNumberOfArguments,

  UnknownMember,
  UninitialisedMember,
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

/**
 * A number literal expression.
 */
export interface NumberNode extends SyntaxNode {
  kind: SyntaxKind.Number;
  value: number;
}

/**
 * An identifier literal expression.
 */
export interface IdentifierNode extends SyntaxNode {
  kind: SyntaxKind.Identifier;
  value: string;
}

/**
 * A boolean literal expression.
 */
export interface BooleanNode extends SyntaxNode {
  kind: SyntaxKind.Boolean;
  value: boolean;
}

export interface StringNode extends SyntaxNode {
  kind: SyntaxKind.String;
  value: string;
}

/**
 * An identifier used in a context where it is
 * referring to the name of a type.
 */
export interface TypeReference extends SyntaxNode {
  kind: SyntaxKind.TypeReference;
  name: IdentifierNode;
}

/**
 * An array type node.
 */
export interface ArrayTypeNode extends SyntaxNode {
  kind: SyntaxKind.ArrayType;

  itemType: TypeNode;
}

export interface OptionalTypeNode extends SyntaxNode {
  kind: SyntaxKind.OptionalType;

  valueType: TypeNode;
}

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

  fnName: IdentifierNode;
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
 * A list of expressions surrounded by square brackets.
 */
export interface ArrayExpression extends SyntaxNode {
  kind: SyntaxKind.ArrayExpression;

  items: ExpressionNode[];
}

export interface StructMemberExpression extends SyntaxNode {
  kind: SyntaxKind.StructMemberExpression;

  name: IdentifierNode;
  value: ExpressionNode;
}

export interface StructExpression extends SyntaxNode {
  kind: SyntaxKind.StructExpression;

  name: IdentifierNode;
  members: Record<string, StructMemberExpression>;
}

export interface NilExpression extends SyntaxNode {
  kind: SyntaxKind.NilExpression;
}

/**
 * The set of all syntax items which are expressions.
 */
export type ExpressionNode
  = NumberNode
  | IdentifierNode
  | BooleanNode
  | StringNode
  | BinaryExpression
  | FnCallExpression
  | ParenExpression
  | ArrayExpression
  | StructExpression
  | NilExpression
  ;

/**
 * A list of statements.
 */
export interface BlockStatement extends SyntaxNode {
  kind: SyntaxKind.BlockStatement;

  statements: StatementNode[];
  exits: BlockExit[];
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

  identifier: IdentifierNode;
  value: ExpressionNode;
}

/**
 * A variable declaration statement. This encompasses
 * both mutable and immutable assignments.
 */
export interface DeclarationStatement extends SyntaxNode {
  kind: SyntaxKind.DeclarationStatement;

  isConst: boolean;
  identifier: IdentifierNode;
  typeNode?: TypeNode;
  value: ExpressionNode;
}

/**
 * A function parameter.
 */
export interface FnParameter extends SyntaxNode {
  kind: SyntaxKind.FnParameter;

  name: IdentifierNode;
  typeNode?: TypeNode;
}

/**
 * A function declaration statement.
 */
export interface FnDeclarationStatement extends SyntaxNode {
  kind: SyntaxKind.FnDeclarationStatement;

  fnName: IdentifierNode;
  params: FnParameter[];
  returnTypeNode?: TypeNode;
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

export interface StructMember extends SyntaxNode {
  kind: SyntaxKind.StructMember;

  isConst: boolean;
  name: IdentifierNode;
  typeNode?: TypeNode;
}

export interface StructDeclStatement extends SyntaxNode {
  kind: SyntaxKind.StructDeclStatement;

  name: IdentifierNode;
  members: Record<string, StructMember>;
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
  | FnParameter
  | StructMember
  | StructMemberExpression
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
