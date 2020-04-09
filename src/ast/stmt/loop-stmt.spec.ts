import test from 'ava';
import { printExpect } from '../../test/macros';
import { createBlockStatement } from './block-stmt';
import { createLoopStatement } from './loop-stmt';

test(
  'simple print',
  printExpect,
  createLoopStatement(
    createBlockStatement(),
  ),
  `(LoopStatement
  (BlockStatement 0
  )
)`,
);
