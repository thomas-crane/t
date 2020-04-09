import test from 'ava';
import { printExpect } from '../../test/macros';
import { createIdentifierExpression } from '../expr/identifier-expr';
import { createOptionalTypeNode } from './optional-type-node';
import { createTypeReference } from './type-reference';

test(
  'simple print',
  printExpect,
  createOptionalTypeNode(
    createTypeReference(
      createIdentifierExpression('num'),
    ),
  ),
  `(OptionalType
  (TypeReference
    (IdentifierExpression "num")
  )
)`,
);
