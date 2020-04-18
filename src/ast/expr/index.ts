import { Type } from '../../type';
import { SyntaxNode } from '../syntax-node';
import { ArrayExpression } from './array-expr';
import { BooleanExpression } from './boolean-expr';
import { FnCallExpression } from './fn-call-expr';
import { NameExpression } from './name-expr';
import { NumberExpression } from './number-expr';
import { ParenExpression } from './paren-expr';
import { StringExpression } from './string-expr';
import { StructExpression } from './struct-expr';

export interface ExpressionSyntaxNode extends SyntaxNode {
  type?: Type;
}

/**
 * The set of all syntax items which are expressions.
 */
export type ExpressionNode
  = NumberExpression
  | NameExpression
  | BooleanExpression
  | StringExpression
  | FnCallExpression
  | ParenExpression
  | ArrayExpression
  | StructExpression
  ;
