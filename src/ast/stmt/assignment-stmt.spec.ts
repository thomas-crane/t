import test from 'ava';
import { printExpect } from '../../test/macros';
import { createIdentifierExpression } from '../expr/identifier-expr';
import { createNumberExpression } from '../expr/number-expr';
import { createAssignmentStatement } from './assignment-stmt';

test(
  'simple print',
  printExpect,
  createAssignmentStatement(
    createIdentifierExpression('test'),
    createNumberExpression(10),
  ),
  `(AssignmentStatement
  (IdentifierExpression "test")
  (NumberExpression 10)
)`,
);
