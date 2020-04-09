import test from 'ava';
import { printExpect } from '../../test/macros';
import { createNumberExpression } from './number-expr';
import { createParenExpression } from './paren-expr';

test(
  'prints the value',
  printExpect,
  createParenExpression(
    createNumberExpression(10),
  ),
  `(ParenExpression
  (NumberExpression 10)
)`,
);
