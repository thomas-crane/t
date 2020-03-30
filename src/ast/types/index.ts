import { SyntaxKind } from '../../types';
import { SyntaxToken } from '../token';
import { ArrayTypeNode } from './array-type-node';
import { OptionalTypeNode } from './optional-type-node';
import { TypeReference } from './type-reference';

/**
 * The set of all syntax items which are types.
 */
export type TypeNode
  = SyntaxToken<SyntaxKind.NumKeyword>
  | SyntaxToken<SyntaxKind.BoolKeyword>
  | SyntaxToken<SyntaxKind.StrKeyword>
  | SyntaxToken<SyntaxKind.NilKeyword>
  | TypeReference
  | ArrayTypeNode
  | OptionalTypeNode
  ;
