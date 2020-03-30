import { Writable } from 'stream';
import { SourceFile } from './ast/source-file';
import { BlockStatement } from './ast/stmt/block-stmt';
import { ReturnStatement } from './ast/stmt/return-stmt';
import { StopStatement } from './ast/stmt/stop-stmt';
import { SyntaxNode } from './ast/syntax-node';
import { SyntaxToken, TokenSyntaxKind } from './ast/token';
import { DiagnosticType } from './diagnostic';

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
