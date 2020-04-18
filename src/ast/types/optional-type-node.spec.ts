import test from 'ava';
import { printExpect } from '../../test/macros';
import { createNameExpression } from '../expr/name-expr';
import { createOptionalTypeNode } from './optional-type-node';
import { createTypeReference } from './type-reference';

test(
  'simple print',
  printExpect,
  createOptionalTypeNode(
    createTypeReference(
      createNameExpression('num'),
    ),
  ),
  `(OptionalType
  (TypeReference
    (IdentifierExpression "num")
  )
)`,
);
