import test from 'ava';
import { printExpect } from '../../test/macros';
import { createIdentifierExpression } from '../expr/identifier-expr';
import { createArrayTypeNode } from './array-type-node';
import { createTypeReference } from './type-reference';

test(
  'simple print',
  printExpect,
  createArrayTypeNode(
    createTypeReference(
      createIdentifierExpression('num'),
    ),
  ),
  `(ArrayType
  (TypeReference
    (IdentifierExpression "num")
  )
)`,
);
