import test from 'ava';
import { printExpect } from '../../test/macros';
import { createIdentifierExpression } from '../expr/identifier-expr';
import { createTypeReference } from '../types/type-reference';
import { createStructDeclStatement, createStructMember } from './struct-decl-stmt';

test(
  'simple print',
  printExpect,
  createStructDeclStatement(
    createIdentifierExpression('Point'),
    {},
  ),
  `(StructDeclStatement
  (IdentifierExpression "Point")
)`,
);

test(
  'prints members',
  printExpect,
  createStructDeclStatement(
    createIdentifierExpression('Point'),
    {
      x: createStructMember(
        true,
        createIdentifierExpression('x'),
        createTypeReference(
          createIdentifierExpression('num'),
        ),
      ),
      y: createStructMember(
        false,
        createIdentifierExpression('y'),
        createTypeReference(
          createIdentifierExpression('num'),
        ),
      ),
    },
  ),
  `(StructDeclStatement
  (IdentifierExpression "Point")
  (StructMember
    (IdentifierExpression "x")
    (TypeReference
      (IdentifierExpression "num")
    )
  )
  (StructMember
    (MutKeyword)
    (IdentifierExpression "y")
    (TypeReference
      (IdentifierExpression "num")
    )
  )
)`,
);
