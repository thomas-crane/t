import test from 'ava';
import { printExpect } from '../../test/macros';
import { createIdentifierExpression } from '../expr/identifier-expr';
import { createExpressionStatement } from './expression-stmt';

test(
  'simple print',
  printExpect,
  createExpressionStatement(
    createIdentifierExpression('test'),
  ),
  `(ExpressionStatement
  (IdentifierExpression "test")
)`,
);
