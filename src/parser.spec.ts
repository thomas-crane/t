import test, { ExecutionContext } from 'ava';
import { createSourceFile } from './factory';
import { createParser } from './parser';
import { printNode } from './printer';
import { DiagnosticCode } from './types';

function parse(t: ExecutionContext, input: string, expected: string) {
  const source = createSourceFile([], input, 'test-file.t');
  const parser = createParser(source);
  const parsedSource = parser.parse();
  const result = printNode(parsedSource);
  t.is(result, expected);
}

function diagnostics(t: ExecutionContext, input: string, expected: DiagnosticCode[]) {
  const source = createSourceFile([], input, 'test-file.t');
  const parser = createParser(source);
  const parsedSource = parser.parse();
  t.deepEqual(parsedSource.diagnostics.map((d) => d.code), expected);
}

// syntax tests
test(
  'Parser recognises identifier literals',
  parse,
  'hello',
  `(SourceFile
  (ExpressionStatement (IdentifierLiteral "hello"))
)`,
);

test(
  'Parser recognises number literals',
  parse,
  '123',
  `(SourceFile
  (ExpressionStatement (NumberLiteral "123"))
)`,
);

test(
  'Parser recognises const declarations',
  parse,
  'let a = 10',
  `(SourceFile
  (DeclarationStatement
    LetKeyword
    (IdentifierLiteral "a")
    (NumberLiteral "10")
  )
)`,
);

test(
  'Parser recognises mutable declarations',
  parse,
  'mut hello = 123',
  `(SourceFile
  (DeclarationStatement
    MutKeyword
    (IdentifierLiteral "hello")
    (NumberLiteral "123")
  )
)`,
);

test(
  'Parser recognises fn declarations',
  parse,
  `fn add: a, b {
  return a + b
}`,
  `(SourceFile
  (FnDeclarationStatement
    (IdentifierLiteral "add")
    (IdentifierLiteral "a")
    (IdentifierLiteral "b")
    (BlockStatement
      (ReturnStatement (BinaryExpression
        (IdentifierLiteral "a")
        +
        (IdentifierLiteral "b")
      ))
    )
  )
)`,
);

test(
  'Parser recognises if statements',
  parse,
  'if a < b { return a }',
  `(SourceFile
  (IfStatement
    (BinaryExpression
      (IdentifierLiteral "a")
      <
      (IdentifierLiteral "b")
    )
    (BlockStatement
      (ReturnStatement (IdentifierLiteral "a"))
    )
  )
)`,
);

test(
  'Parser recognises loop statements',
  parse,
  'loop { stop }',
  `(SourceFile
  (LoopStatement
    (BlockStatement
      (StopStatement)
    )
  )
)`,
);

test(
  'Parser recognises assignment statements',
  parse,
  'a = 10',
  `(SourceFile
  (AssignmentStatement
    (IdentifierLiteral "a")
    (NumberLiteral "10")
  )
)`,
);

test(
  'Parser recognises return statements',
  parse,
  'return 10',
  `(SourceFile
  (ReturnStatement (NumberLiteral "10"))
)`,
);

test(
  'Parser recognises expression statements',
  parse,
  '10',
  `(SourceFile
  (ExpressionStatement (NumberLiteral "10"))
)`,
);

test(
  'Parser recognises fn calls expressions',
  parse,
  'add(1, 2)',
  `(SourceFile
  (ExpressionStatement (FnCallExpression
    (IdentifierLiteral "add")
    (NumberLiteral "1")
    (NumberLiteral "2")
  ))
)`,
);

test(
  'Parser recognises paren expressions',
  parse,
  '(1 + 2)',
  `(SourceFile
  (ExpressionStatement (ParenExpression (BinaryExpression
    (NumberLiteral "1")
    +
    (NumberLiteral "2")
  )))
)`,
);

// precedence tests
test(
  'Binary precedence puts multiplication above addition',
  parse,
  '1 + 2 * 3 - 4',
  `(SourceFile
  (ExpressionStatement (BinaryExpression
    (BinaryExpression
      (NumberLiteral "1")
      +
      (BinaryExpression
        (NumberLiteral "2")
        *
        (NumberLiteral "3")
      )
    )
    -
    (NumberLiteral "4")
  ))
)`,
);

// diagnostic tests
test(
  'Parser reports unexpected token diagnostics',
  diagnostics,
  '1 + { 2',
  [DiagnosticCode.UnexpectedToken],
);
