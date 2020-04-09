import test from 'ava';
import { printExpect } from '../../test/macros';
import { createIdentifierExpression } from '../expr/identifier-expr';
import { createNumberExpression } from '../expr/number-expr';
import { createTypeReference } from '../types/type-reference';
import { createDeclarationStatement } from './declaration-stmt';

test(
  'uses let for immutable declarations',
  printExpect,
  createDeclarationStatement(
    true,
    createIdentifierExpression('x'),
    undefined,
    createNumberExpression(10),
  ),
  `(DeclarationStatement
  LetKeyword
  (IdentifierExpression "x")
  (NumberExpression 10)
)`,
);

test(
  'uses mut for mutable declarations',
  printExpect,
  createDeclarationStatement(
    false,
    createIdentifierExpression('x'),
    undefined,
    createNumberExpression(10),
  ),
  `(DeclarationStatement
  MutKeyword
  (IdentifierExpression "x")
  (NumberExpression 10)
)`,
);
test(
  'prints the type node if it is present',
  printExpect,
  createDeclarationStatement(
    true,
    createIdentifierExpression('x'),
    createTypeReference(
      createIdentifierExpression('num'),
    ),
    createNumberExpression(10),
  ),
  `(DeclarationStatement
  LetKeyword
  (IdentifierExpression "x")
  (TypeReference
    (IdentifierExpression "num")
  )
  (NumberExpression 10)
)`,
);
