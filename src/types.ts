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
  Checker = 1 << 2,
}

/**
 * The base type of all types which represent some kind of diagnostic.
 */
interface Diagnostic {
  kind: DiagnosticKind;
  source: DiagnosticSource;
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
  kind: DiagnosticKind.Warning;
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

  // literals
  IdentifierLiteral,
  NumberLiteral,

  // statements
  BlockStatement,
  IfStatement,
  AssignmentStatement,
  DeclarationStatement,
  FnDeclarationStatement,
  ReturnStatement,
  LoopStatement,

  SourceFile,
}

/**
 * The base type of all types which represent some kind of syntax.
 */
interface SyntaxNode extends TextRange {
  kind: SyntaxKind;
  flags: SyntaxNodeFlags;
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
 * The set of all syntax items which are expressions.
 */
export type ExpressionNode
  = NumberLiteral
  | IdentifierLiteral
  | BinaryExpression
  | FnCallExpression
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
  | SourceFile
  ;

/**
 * An interface for turning some text into a stream of tokens.
 */
export interface Lexer {
  nextToken(): SyntaxToken<TokenSyntaxKind>;
  getDiagnostics(): DiagnosticType[];
}
