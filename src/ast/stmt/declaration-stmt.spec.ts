import test from 'ava';
import { printExpect } from '../../test/macros';
import { createNameExpression } from '../expr/name-expr';
import { createNumberExpression } from '../expr/number-expr';
import { createTypeReference } from '../types/type-reference';
import { createDeclarationStatement } from './declaration-stmt';

test(
  'uses let for immutable declarations',
  printExpect,
  createDeclarationStatement(
    true,
    createNameExpression('x'),
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
    createNameExpression('x'),
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
    createNameExpression('x'),
    createTypeReference(
      createNameExpression('num'),
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
