import test from 'ava';
import { printExpect } from '../../test/macros';
import { createNumberExpression } from '../expr/number-expr';
import { createBlockStatement } from './block-stmt';
import { createExpressionStatement } from './expression-stmt';
import { createGotoStatement } from './goto-stmt';
import { createReturnStatement } from './return-stmt';

// printer tests
test(
  'simple print',
  printExpect,
  createBlockStatement(),
  '(BlockStatement 0\n)',
);

const printStmtsBlock = createBlockStatement();
printStmtsBlock.statements = [
  createExpressionStatement(
    createNumberExpression(10),
  ),
];
test(
  'prints statements in the block',
  printExpect,
  printStmtsBlock,
  `(BlockStatement 0
  (ExpressionStatement
    (NumberExpression 10)
  )
)`,
);

const printUnreachableBlock = createBlockStatement();
printUnreachableBlock.afterExit = [
  createExpressionStatement(
    createNumberExpression(10),
  ),
];
test(
  'prints the unreachable statements in the block',
  printExpect,
  printUnreachableBlock,
  `(BlockStatement 0
  (Unreachable
    (ExpressionStatement
      (NumberExpression 10)
    )
  )
)`,
);

const printExitBlock = createBlockStatement();
printExitBlock.exit = createReturnStatement(
  createNumberExpression(10),
);
test(
  `prints the block's exit`,
  printExpect,
  printExitBlock,
  `(BlockStatement 0
  (ReturnStatement
    (NumberExpression 10)
  )
)`,
);

const printLoopBlock = createBlockStatement();
printLoopBlock.exit = createGotoStatement(printLoopBlock);
test(
  'does not recursively print loops',
  printExpect,
  printLoopBlock,
  `(BlockStatement 0
  (GotoStatement
    (--> BlockStatement 0)
  )
)`,
);
