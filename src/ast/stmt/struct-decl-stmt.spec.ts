import test from 'ava';
import { printExpect } from '../../test/macros';
import { createNameExpression } from '../expr/name-expr';
import { createTypeReference } from '../types/type-reference';
import { createStructDeclStatement, createStructMember } from './struct-decl-stmt';

test(
  'simple print',
  printExpect,
  createStructDeclStatement(
    createNameExpression('Point'),
    {},
  ),
  `(StructDeclStatement
  (NameExpression "Point")
)`,
);

test(
  'prints members',
  printExpect,
  createStructDeclStatement(
    createNameExpression('Point'),
    {
      x: createStructMember(
        true,
        createNameExpression('x'),
        createTypeReference(
          createNameExpression('num'),
        ),
      ),
      y: createStructMember(
        false,
        createNameExpression('y'),
        createTypeReference(
          createNameExpression('num'),
        ),
      ),
    },
  ),
  `(StructDeclStatement
  (NameExpression "Point")
  (StructMember
    (NameExpression "x")
    (TypeReference
      (NameExpression "num")
    )
  )
  (StructMember
    (MutKeyword)
    (NameExpression "y")
    (TypeReference
      (NameExpression "num")
    )
  )
)`,
);
