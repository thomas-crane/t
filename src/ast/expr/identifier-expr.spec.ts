import test from 'ava';
import { printExpect } from '../../test/macros';
import { createIdentifierExpression } from './identifier-expr';

test(
  'prints the value',
  printExpect,
  createIdentifierExpression('test'),
  '(IdentifierExpression "test")',
);
