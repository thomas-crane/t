import { ArrayTypeNode } from './array-type-node';
import { OptionalTypeNode } from './optional-type-node';
import { TypeReference } from './type-reference';

/**
 * The set of all syntax items which are types.
 */
export type TypeNode
  = TypeReference
  | ArrayTypeNode
  | OptionalTypeNode
  ;
