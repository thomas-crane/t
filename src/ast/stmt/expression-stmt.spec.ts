import test from 'ava';
import { printExpect } from '../../test/macros';
import { createNameExpression } from '../expr/name-expr';
import { createExpressionStatement } from './expression-stmt';

test(
  'simple print',
  printExpect,
  createExpressionStatement(
    createNameExpression('test'),
  ),
  `(ExpressionStatement
  (NameExpression "test")
)`,
);
