import test, { ExecutionContext } from 'ava';
import * as factory from './factory';
import { printNode } from './printer';
import { Node, SyntaxKind } from './types';

function testPrint(t: ExecutionContext, node: Node, expected: string) {
  const result = printNode(node);
  t.is(result, expected);
}

test(
  'Printer works for identifiers',
  testPrint,
  factory.createIdentifier('hello'),
  '(IdentifierLiteral "hello")',
);

test(
  'Printer works for number literals',
  testPrint,
  factory.createNumberLiteral(10),
  '(NumberLiteral "10")',
);

test(
  'Printer works for binary expressions',
  testPrint,
  factory.createBinaryExpression(
    factory.createNumberLiteral(10),
    factory.createToken(SyntaxKind.PlusToken),
    factory.createNumberLiteral(20),
  ),
  `(BinaryExpression
  (NumberLiteral "10")
  +
  (NumberLiteral "20")
)`,
);

test(
  'Printer works for function calls.',
  testPrint,
  factory.createFnCallExpression(
    factory.createIdentifier('add'),
    [
      factory.createNumberLiteral(10),
      factory.createNumberLiteral(20),
    ],
  ),
  `(FnCallExpression
  (IdentifierLiteral "add")
  (NumberLiteral "10")
  (NumberLiteral "20")
)`,
);

test(
  'Printer works for paren expressions',
  testPrint,
  factory.createParenExpression(
    factory.createIdentifier('test'),
  ),
  '(ParenExpression (IdentifierLiteral "test"))',
);

test(
  'Printer works for block statements',
  testPrint,
  factory.createBlockStatement([
    factory.createExpressionStatement(
      factory.createNumberLiteral(10),
    ),
  ]),
  `(BlockStatement
  (ExpressionStatement (NumberLiteral "10"))
)`,
);

test(
  'Printer works for if statements without an else',
  testPrint,
  factory.createIfStatement(
    factory.createNumberLiteral(1),
    factory.createBlockStatement([
      factory.createExpressionStatement(
        factory.createNumberLiteral(10),
      ),
    ]),
  ),
  `(IfStatement
  (NumberLiteral "1")
  (BlockStatement
    (ExpressionStatement (NumberLiteral "10"))
  )
)`,
);

test(
  'Printer works for if statements with an else',
  testPrint,
  factory.createIfStatement(
    factory.createNumberLiteral(1),
    factory.createBlockStatement([
      factory.createExpressionStatement(
        factory.createNumberLiteral(10),
      ),
    ]),
    factory.createBlockStatement([
      factory.createExpressionStatement(
        factory.createNumberLiteral(20),
      ),
    ]),
  ),
  `(IfStatement
  (NumberLiteral "1")
  (BlockStatement
    (ExpressionStatement (NumberLiteral "10"))
  )
  (BlockStatement
    (ExpressionStatement (NumberLiteral "20"))
  )
)`,
);

test(
  'Printer works for assignment statements',
  testPrint,
  factory.createAssignmentStatement(
    factory.createIdentifier('a'),
    factory.createNumberLiteral(10),
  ),
  `(AssignmentStatement
  (IdentifierLiteral "a")
  (NumberLiteral "10")
)`,
);

test(
  'Printer works for declaration statements',
  testPrint,
  factory.createDeclarationStatement(
    false,
    factory.createIdentifier('test'),
    factory.createNumberLiteral(20),
  ),
  `(DeclarationStatement
  MutKeyword
  (IdentifierLiteral "test")
  (NumberLiteral "20")
)`,
);

test(
  'Printer works for fn declaration statements',
  testPrint,
  factory.createFnDeclarationStatement(
    factory.createIdentifier('add'),
    [
      factory.createIdentifier('x'),
      factory.createIdentifier('y'),
    ],
    factory.createBlockStatement([
      factory.createReturnStatement(
        factory.createBinaryExpression(
          factory.createIdentifier('x'),
          factory.createToken(SyntaxKind.PlusToken),
          factory.createIdentifier('y'),
        ),
      ),
    ]),
  ),
  `(FnDeclarationStatement
  (IdentifierLiteral "add")
  (IdentifierLiteral "x")
  (IdentifierLiteral "y")
  (BlockStatement
    (ReturnStatement (BinaryExpression
      (IdentifierLiteral "x")
      +
      (IdentifierLiteral "y")
    ))
  )
)`,
);

test(
  'Printer works for return statements',
  testPrint,
  factory.createReturnStatement(
    factory.createNumberLiteral(10),
  ),
  '(ReturnStatement (NumberLiteral "10"))',
);

test(
  'Printer works for loop statements',
  testPrint,
  factory.createLoopStatement(
    factory.createBlockStatement([
      factory.createExpressionStatement(
        factory.createNumberLiteral(100),
      ),
    ]),
  ),
  `(LoopStatement
  (BlockStatement
    (ExpressionStatement (NumberLiteral "100"))
  )
)`,
);

test(
  'Printer works for expression statements',
  testPrint,
  factory.createExpressionStatement(
    factory.createIdentifier('hello'),
  ),
  '(ExpressionStatement (IdentifierLiteral "hello"))',
);

test(
  'Printer works for source files',
  testPrint,
  factory.createSourceFile([
    factory.createExpressionStatement(
      factory.createNumberLiteral(100),
    ),
  ], '100', 'testfile'),
  `(SourceFile
  (ExpressionStatement (NumberLiteral "100"))
)`,
);
