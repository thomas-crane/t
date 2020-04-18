import test from 'ava';
import { printExpect } from '../../test/macros';
import { createNameExpression } from './name-expr';
import { createNumberExpression } from './number-expr';
import { createStructExpression, createStructMemberExpression } from './struct-expr';

// printer tests
test(
  'simple print',
  printExpect,
  createStructExpression(
    createNameExpression('Point'),
    {},
  ),
  `(StructExpression
  (NameExpression "Point")
)`,
);
test(
  'prints members',
  printExpect,
  createStructExpression(
    createNameExpression('Point'),
    {
      x: createStructMemberExpression(
        createNameExpression('x'),
        createNumberExpression(10),
      ),
      y: createStructMemberExpression(
        createNameExpression('y'),
        createNumberExpression(20),
      ),
    },
  ),
  `(StructExpression
  (NameExpression "Point")
  (StructMemberExpression
    (NameExpression "x")
    (NumberExpression 10)
  )
  (StructMemberExpression
    (NameExpression "y")
    (NumberExpression 20)
  )
)`,
);
