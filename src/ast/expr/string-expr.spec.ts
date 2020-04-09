import test from 'ava';
import { printExpect } from '../../test/macros';
import { createStringExpression } from './string-expr';

test(
  'prints the value',
  printExpect,
  createStringExpression('hello world'),
  '(StringExpression "hello world")',
);
