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
  factory.createIdentifierNode('hello'),
  '(IdentifierNode "hello")',
);

test(
  'Printer works for number literals',
  testPrint,
  factory.createNumberNode(10),
  '(NumberNode "10")',
);

test(
  'Printer works for binary expressions',
  testPrint,
  factory.createBinaryExpression(
    factory.createNumberNode(10),
    factory.createToken(SyntaxKind.PlusToken),
    factory.createNumberNode(20),
  ),
  `(BinaryExpression
  (NumberNode "10")
  +
  (NumberNode "20")
)`,
);

test(
  'Printer works for function calls.',
  testPrint,
  factory.createFnCallExpression(
    factory.createIdentifierNode('add'),
    [
      factory.createNumberNode(10),
      factory.createNumberNode(20),
    ],
  ),
  `(FnCallExpression
  (IdentifierNode "add")
  (NumberNode "10")
  (NumberNode "20")
)`,
);

test(
  'Printer works for paren expressions',
  testPrint,
  factory.createParenExpression(
    factory.createIdentifierNode('test'),
  ),
  '(ParenExpression (IdentifierNode "test"))',
);

test(
  'Printer works for block statements',
  testPrint,
  factory.createBlockStatement([
    factory.createExpressionStatement(
      factory.createNumberNode(10),
    ),
  ]),
  `(BlockStatement
  (ExpressionStatement (NumberNode "10"))
)`,
);

test(
  'Printer works for if statements without an else',
  testPrint,
  factory.createIfStatement(
    factory.createNumberNode(1),
    factory.createBlockStatement([
      factory.createExpressionStatement(
        factory.createNumberNode(10),
      ),
    ]),
  ),
  `(IfStatement
  (NumberNode "1")
  (BlockStatement
    (ExpressionStatement (NumberNode "10"))
  )
)`,
);

test(
  'Printer works for if statements with an else',
  testPrint,
  factory.createIfStatement(
    factory.createNumberNode(1),
    factory.createBlockStatement([
      factory.createExpressionStatement(
        factory.createNumberNode(10),
      ),
    ]),
    factory.createBlockStatement([
      factory.createExpressionStatement(
        factory.createNumberNode(20),
      ),
    ]),
  ),
  `(IfStatement
  (NumberNode "1")
  (BlockStatement
    (ExpressionStatement (NumberNode "10"))
  )
  (BlockStatement
    (ExpressionStatement (NumberNode "20"))
  )
)`,
);

test(
  'Printer works for assignment statements',
  testPrint,
  factory.createAssignmentStatement(
    factory.createIdentifierNode('a'),
    factory.createNumberNode(10),
  ),
  `(AssignmentStatement
  (IdentifierNode "a")
  (NumberNode "10")
)`,
);

test(
  'Printer works for declaration statements',
  testPrint,
  factory.createDeclarationStatement(
    false,
    factory.createIdentifierNode('test'),
    factory.createNumberNode(20),
  ),
  `(DeclarationStatement
  MutKeyword
  (IdentifierNode "test")
  (NumberNode "20")
)`,
);

test(
  'Printer works for fn declaration statements',
  testPrint,
  factory.createFnDeclarationStatement(
    factory.createIdentifierNode('add'),
    [
      factory.createFnParameter(
        factory.createIdentifierNode('x'),
      ),
      factory.createFnParameter(
        factory.createIdentifierNode('y'),
      ),
    ],
    factory.createBlockStatement([
      factory.createReturnStatement(
        factory.createBinaryExpression(
          factory.createIdentifierNode('x'),
          factory.createToken(SyntaxKind.PlusToken),
          factory.createIdentifierNode('y'),
        ),
      ),
    ]),
  ),
  `(FnDeclarationStatement
  (IdentifierNode "add")
  (FnParameter (IdentifierNode "x"))
  (FnParameter (IdentifierNode "y"))
  (BlockStatement
    (ReturnStatement (BinaryExpression
      (IdentifierNode "x")
      +
      (IdentifierNode "y")
    ))
  )
)`,
);

test(
  'Printer works for return statements',
  testPrint,
  factory.createReturnStatement(
    factory.createNumberNode(10),
  ),
  '(ReturnStatement (NumberNode "10"))',
);

test(
  'Printer works for loop statements',
  testPrint,
  factory.createLoopStatement(
    factory.createBlockStatement([
      factory.createExpressionStatement(
        factory.createNumberNode(100),
      ),
    ]),
  ),
  `(LoopStatement
  (BlockStatement
    (ExpressionStatement (NumberNode "100"))
  )
)`,
);

test(
  'Printer works for expression statements',
  testPrint,
  factory.createExpressionStatement(
    factory.createIdentifierNode('hello'),
  ),
  '(ExpressionStatement (IdentifierNode "hello"))',
);

test(
  'Printer works for source files',
  testPrint,
  factory.createSourceFile([
    factory.createExpressionStatement(
      factory.createNumberNode(100),
    ),
  ], '100', 'testfile'),
  `(SourceFile
  (ExpressionStatement (NumberNode "100"))
)`,
);
