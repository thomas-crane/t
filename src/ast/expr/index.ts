import { ArrayExpression } from './array-expr';
import { BinaryExpression } from './binary-expr';
import { BooleanExpression } from './boolean-expr';
import { FnCallExpression } from './fn-call-expr';
import { IdentifierExpression } from './identifier-expr';
import { IndexExpression } from './index-expr';
import { MemberAccessExpression } from './member-access-expr';
import { NumberExpression } from './number-expr';
import { ParenExpression } from './paren-expr';
import { StringExpression } from './string-expr';
import { StructExpression } from './struct-expr';

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
