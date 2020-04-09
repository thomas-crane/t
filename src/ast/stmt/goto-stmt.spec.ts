import test from 'ava';
import { printExpect } from '../../test/macros';
import { createBlockStatement } from './block-stmt';
import { createGotoStatement } from './goto-stmt';

test(
  'simple print',
  printExpect,
  createGotoStatement(
    createBlockStatement(),
  ),
  `(GotoStatement
  (BlockStatement 0
  )
)`,
);
