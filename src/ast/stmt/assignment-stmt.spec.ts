import test from 'ava';
import { printExpect } from '../../test/macros';
import { createNameExpression } from '../expr/name-expr';
import { createNumberExpression } from '../expr/number-expr';
import { createAssignmentStatement } from './assignment-stmt';

test(
  'simple print',
  printExpect,
  createAssignmentStatement(
    createNameExpression('test'),
    createNumberExpression(10),
  ),
  `(AssignmentStatement
  (IdentifierExpression "test")
  (NumberExpression 10)
)`,
);
