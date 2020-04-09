import test from 'ava';
import { printExpect } from '../../test/macros';
import { createNumberExpression } from '../expr/number-expr';
import { createReturnStatement } from './return-stmt';

test(
  'simple print',
  printExpect,
  createReturnStatement(
    createNumberExpression(10),
  ),
  `(ReturnStatement
  (NumberExpression 10)
)`,
);
