import test from 'ava';
import { printExpect } from '../../test/macros';
import { createNameExpression } from '../expr/name-expr';
import { createTypeReference } from './type-reference';

test(
  'simple print',
  printExpect,
  createTypeReference(
    createNameExpression('SomeType'),
  ),
  `(TypeReference
  (NameExpression "SomeType")
)`,
);
