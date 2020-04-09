import test from 'ava';
import { binaryOpName } from '../../common/op-names';
import { printExpect } from '../../test/macros';
import { SyntaxKind } from '../syntax-node';
import { createFnCallExpression, FnCallFlags } from './fn-call-expr';
import { createIdentifierExpression } from './identifier-expr';
import { createNumberExpression } from './number-expr';

// printer tests
test(
  'binary expressions',
  printExpect,
  createFnCallExpression(
    createIdentifierExpression(binaryOpName[SyntaxKind.PlusToken]),
    [
      createNumberExpression(10),
      createNumberExpression(20),
    ],
    FnCallFlags.Operator | FnCallFlags.BinaryOp,
  ),
  `(BinaryExpression
  (NumberExpression 10)
  (IdentifierExpression "+")
  (NumberExpression 20)
)`,
);
test(
  'unary expressions',
  printExpect,
  createFnCallExpression(
    createIdentifierExpression(binaryOpName[SyntaxKind.PlusToken]),
    [
      createNumberExpression(10),
    ],
    FnCallFlags.Operator | FnCallFlags.UnaryOp,
  ),
  `(UnaryExpression
  (IdentifierExpression "+")
  (NumberExpression 10)
)`,
);
test(
  'field access',
  printExpect,
  createFnCallExpression(
    createIdentifierExpression('target'),
    [
      createIdentifierExpression('member'),
    ],
    FnCallFlags.FieldAccess,
  ),
  `(FieldAccess
  (IdentifierExpression "target")
  (IdentifierExpression "member")
)`,
);
test(
  'index',
  printExpect,
  createFnCallExpression(
    createIdentifierExpression('arr'),
    [
      createNumberExpression(0),
    ],
    FnCallFlags.Index,
  ),
  `(IndexExpression
  (IdentifierExpression "arr")
  (NumberExpression 0)
)`,
);
