import test from 'ava';
import { printExpect } from '../../test/macros';
import { createBooleanExpression } from '../expr/boolean-expr';
import { createBlockStatement } from './block-stmt';
import { createIfStatement } from './if-stmt';

test(
  'simple print',
  printExpect,
  createIfStatement(
    createBooleanExpression(true),
    createBlockStatement(),
    createBlockStatement(),
  ),
  `(IfStatement
  (BooleanExpression true)
  (BlockStatement 0
  )
  (BlockStatement 1
  )
)`,
);
