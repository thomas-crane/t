import { Writable } from 'stream';
import { SourceFile } from './ast/source-file';
import { BlockStatement } from './ast/stmt/block-stmt';
import { ReturnStatement } from './ast/stmt/return-stmt';
import { StopStatement } from './ast/stmt/stop-stmt';
import { SyntaxToken, TokenSyntaxKind } from './ast/token';
import { DiagnosticType } from './diagnostic';

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
