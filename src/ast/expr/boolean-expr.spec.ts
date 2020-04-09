import test from 'ava';
import { printExpect } from '../../test/macros';
import { createBooleanExpression } from './boolean-expr';

test(
  'prints the value',
  printExpect,
  createBooleanExpression(true),
  '(BooleanExpression true)',
);
