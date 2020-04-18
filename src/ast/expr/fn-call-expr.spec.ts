import test from 'ava';
import { binaryOpName } from '../../common/op-names';
import { printExpect } from '../../test/macros';
import { SyntaxKind } from '../syntax-node';
import { createFnCallExpression, FnCallFlags } from './fn-call-expr';
import { createNameExpression } from './name-expr';
import { createNumberExpression } from './number-expr';

// printer tests
test(
  'binary expressions',
  printExpect,
  createFnCallExpression(
    createNameExpression(binaryOpName[SyntaxKind.PlusToken]),
    [
      createNumberExpression(10),
      createNumberExpression(20),
    ],
    FnCallFlags.Operator | FnCallFlags.BinaryOp,
  ),
  `(BinaryExpression
  (NumberExpression 10)
  (NameExpression "+")
  (NumberExpression 20)
)`,
);
test(
  'unary expressions',
  printExpect,
  createFnCallExpression(
    createNameExpression(binaryOpName[SyntaxKind.PlusToken]),
    [
      createNumberExpression(10),
    ],
    FnCallFlags.Operator | FnCallFlags.UnaryOp,
  ),
  `(UnaryExpression
  (NameExpression "+")
  (NumberExpression 10)
)`,
);
test(
  'field access',
  printExpect,
  createFnCallExpression(
    createNameExpression('target'),
    [
      createNameExpression('member'),
    ],
    FnCallFlags.FieldAccess,
  ),
  `(FieldAccess
  (NameExpression "target")
  (NameExpression "member")
)`,
);
test(
  'index',
  printExpect,
  createFnCallExpression(
    createNameExpression('arr'),
    [
      createNumberExpression(0),
    ],
    FnCallFlags.Index,
  ),
  `(IndexExpression
  (NameExpression "arr")
  (NumberExpression 0)
)`,
);
