import { ExpressionNode } from './expr';
import { SourceFile } from './source-file';
import { StatementNode } from './stmt';

/**
 * The set of all syntax item types.
 */
export type Node
  = StatementNode
  | ExpressionNode
  | SourceFile
  ;
