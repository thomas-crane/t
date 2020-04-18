import test from 'ava';
import { printExpect } from '../../test/macros';
import { createNameExpression } from './name-expr';

test(
  'prints the value',
  printExpect,
  createNameExpression('test'),
  '(NameExpression "test")',
);
