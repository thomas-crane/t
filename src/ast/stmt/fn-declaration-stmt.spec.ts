import test from 'ava';
import { printExpect } from '../../test/macros';
import { createIdentifierExpression } from '../expr/identifier-expr';
import { createTypeReference } from '../types/type-reference';
import { createBlockStatement } from './block-stmt';
import { createFnDeclarationStatement, createFnParameter } from './fn-declaration-stmt';

test(
  'simple print',
  printExpect,
  createFnDeclarationStatement(
    createIdentifierExpression('add'),
    [
      createFnParameter(
        createIdentifierExpression('a'),
        createTypeReference(
          createIdentifierExpression('num'),
        ),
      ),
      createFnParameter(
        createIdentifierExpression('b'),
        createTypeReference(
          createIdentifierExpression('num'),
        ),
      ),
    ],
    createTypeReference(
      createIdentifierExpression('num'),
    ),
    createBlockStatement(),
  ),
  `(FnDeclarationStatement
  (IdentifierExpression "add")
  (FnParameter
    (IdentifierExpression "a")
    (TypeReference
      (IdentifierExpression "num")
    )
  )
  (FnParameter
    (IdentifierExpression "b")
    (TypeReference
      (IdentifierExpression "num")
    )
  )
  (TypeReference
    (IdentifierExpression "num")
  )
  (BlockStatement 0
  )
)`,
);
