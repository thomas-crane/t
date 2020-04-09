import test from 'ava';
import { printExpect } from '../../test/macros';
import { createNumberExpression } from './number-expr';

test(
  'prints the value',
  printExpect,
  createNumberExpression(123),
  '(NumberExpression 123)',
);
