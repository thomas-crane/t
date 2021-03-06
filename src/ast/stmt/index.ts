import { AssignmentStatement } from './assignment-stmt';
import { BlockEnd } from './block-end';
import { BlockStatement } from './block-stmt';
import { DeclarationStatement } from './declaration-stmt';
import { ExpressionStatement } from './expression-stmt';
import { FnDeclarationStatement } from './fn-declaration-stmt';
import { GotoStatement } from './goto-stmt';
import { IfStatement } from './if-stmt';
import { LoopStatement } from './loop-stmt';
import { ReturnStatement } from './return-stmt';
import { StructDeclStatement } from './struct-decl-stmt';

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
  | ExpressionStatement
  | StructDeclStatement
  | GotoStatement
  | BlockEnd
  ;
