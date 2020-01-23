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

  Program,
}

/**
 * The base type of all types which represent some kind of syntax.
 */
interface SyntaxNode {
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
 * A token. These are generally just single characters such as
 * operators.
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
 * A top level node which contains the list of statements in a program.
 */
export interface ProgramNode extends SyntaxNode {
  kind: SyntaxKind.Program;
  statements: StatementNode[];
}

/**
 * The set of all syntax item types.
 */
export type Node
  = StatementNode
  | ExpressionNode
  | ProgramNode
  ;
