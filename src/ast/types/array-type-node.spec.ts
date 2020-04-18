import test from 'ava';
import { printExpect } from '../../test/macros';
import { createNameExpression } from '../expr/name-expr';
import { createArrayTypeNode } from './array-type-node';
import { createTypeReference } from './type-reference';

test(
  'simple print',
  printExpect,
  createArrayTypeNode(
    createTypeReference(
      createNameExpression('num'),
    ),
  ),
  `(ArrayType
  (TypeReference
    (NameExpression "num")
  )
)`,
);
