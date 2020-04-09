import test from 'ava';
import { printExpect } from '../../test/macros';
import { createArrayExpression } from './array-expr';
import { createNumberExpression } from './number-expr';
import { createStringExpression } from './string-expr';

test(
  'simple print',
  printExpect,
  createArrayExpression([]),
  '(ArrayExpression\n)',
);

test(
  'prints its items',
  printExpect,
  createArrayExpression([
    createNumberExpression(10),
    createStringExpression('test'),
  ]),
  `(ArrayExpression
  (NumberExpression 10)
  (StringExpression "test")
)`,
);
