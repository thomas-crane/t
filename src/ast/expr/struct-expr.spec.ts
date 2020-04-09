import test from 'ava';
import { printExpect } from '../../test/macros';
import { createIdentifierExpression } from './identifier-expr';
import { createNumberExpression } from './number-expr';
import { createStructExpression, createStructMemberExpression } from './struct-expr';

// printer tests
test(
  'simple print',
  printExpect,
  createStructExpression(
    createIdentifierExpression('Point'),
    {},
  ),
  `(StructExpression
  (IdentifierExpression "Point")
)`,
);
test(
  'prints members',
  printExpect,
  createStructExpression(
    createIdentifierExpression('Point'),
    {
      x: createStructMemberExpression(
        createIdentifierExpression('x'),
        createNumberExpression(10),
      ),
      y: createStructMemberExpression(
        createIdentifierExpression('y'),
        createNumberExpression(20),
      ),
    },
  ),
  `(StructExpression
  (IdentifierExpression "Point")
  (StructMemberExpression
    (IdentifierExpression "x")
    (NumberExpression 10)
  )
  (StructMemberExpression
    (IdentifierExpression "y")
    (NumberExpression 20)
  )
)`,
);
