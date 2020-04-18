import test from 'ava';
import { printExpect } from '../../test/macros';
import { createNameExpression } from '../expr/name-expr';
import { createTypeReference } from '../types/type-reference';
import { createBlockStatement } from './block-stmt';
import { createFnDeclarationStatement, createFnParameter } from './fn-declaration-stmt';

test(
  'simple print',
  printExpect,
  createFnDeclarationStatement(
    createNameExpression('add'),
    [
      createFnParameter(
        createNameExpression('a'),
        createTypeReference(
          createNameExpression('num'),
        ),
      ),
      createFnParameter(
        createNameExpression('b'),
        createTypeReference(
          createNameExpression('num'),
        ),
      ),
    ],
    createTypeReference(
      createNameExpression('num'),
    ),
    createBlockStatement(),
  ),
  `(FnDeclarationStatement
  (NameExpression "add")
  (FnParameter
    (NameExpression "a")
    (TypeReference
      (NameExpression "num")
    )
  )
  (FnParameter
    (NameExpression "b")
    (TypeReference
      (NameExpression "num")
    )
  )
  (TypeReference
    (NameExpression "num")
  )
  (BlockStatement 0
  )
)`,
);
