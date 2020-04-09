import test from 'ava';
import { printExpect } from '../../test/macros';
import { createIdentifierExpression } from '../expr/identifier-expr';
import { createTypeReference } from './type-reference';

test(
  'simple print',
  printExpect,
  createTypeReference(
    createIdentifierExpression('SomeType'),
  ),
  `(TypeReference
  (IdentifierExpression "SomeType")
)`,
);
