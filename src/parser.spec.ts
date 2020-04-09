import test, { ExecutionContext } from 'ava';
import { createSourceFile } from './ast/source-file';
import { FnDeclarationStatement } from './ast/stmt/fn-declaration-stmt';
import { DiagnosticCode } from './diagnostic/diagnostic-code';
import { createParser } from './parser';
import { createPrinter } from './printer';

function parse(t: ExecutionContext, input: string, expected: string) {
  // wrap the input in a `fn main` block.
  input = `fn main(): nil { ${input} }`;
  const source = createSourceFile([], input, 'test-file.t');
  const parser = createParser(source);
  const parsedSource = parser.parse();
  // unwrap the result to get the first statement.
  const stmt = (parsedSource.statements[0] as FnDeclarationStatement).body.statements[0];
  const printer = createPrinter();
  printer.printNode(stmt);
  const result = printer.flush();
  // add a newline to the expected string since the printer always adds one.
  expected += '\n';
  t.is(result, expected);
}

function parseExit(t: ExecutionContext, input: string, expected: string) {
  // wrap the input in a `fn main` block.
  input = `fn main(): nil { ${input} }`;
  const source = createSourceFile([], input, 'test-file.t');
  const parser = createParser(source);
  const parsedSource = parser.parse();
  // unwrap the result to get the exit.
  const stmt = (parsedSource.statements[0] as FnDeclarationStatement).body.exit;
  const printer = createPrinter();
  printer.printNode(stmt);
  const result = printer.flush();
  // add a newline to the expected string since the printer always adds one.
  expected += '\n';
  t.is(result, expected);
}

function parseTopLevel(t: ExecutionContext, input: string, expected: string) {
  const source = createSourceFile([], input, 'test-file.t');
  const parser = createParser(source);
  const parsedSource = parser.parse();
  // unwrap the result to get the first top level statement.
  const stmt = parsedSource.statements[0];
  const printer = createPrinter();
  printer.printNode(stmt);
  const result = printer.flush();
  // add a newline to the expected string since the printer always adds one.
  expected += '\n';
  t.is(result, expected);
}

function diagnostics(t: ExecutionContext, input: string, expected: DiagnosticCode[]) {
  // wrap the input in a `fn main` block.
  input = `fn main(): nil { ${input} }`;
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
  `(ExpressionStatement
  (IdentifierExpression "hello")
)`,
);

test(
  'Parser recognises number literals',
  parse,
  '123',
  `(ExpressionStatement
  (NumberExpression 123)
)`,
);

test(
  'Parser recognises boolean literals',
  parse,
  'true',
  `(ExpressionStatement
  (BooleanExpression true)
)`,
);

test(
  'Parser recognises array expressions',
  parse,
  '[1, 2, 3]',
  `(ExpressionStatement
  (ArrayExpression
    (NumberExpression 1)
    (NumberExpression 2)
    (NumberExpression 3)
  )
)`,
);

test(
  'Parser recognises array expressions with trailing commas',
  parse,
  '[true, false,]',
  `(ExpressionStatement
  (ArrayExpression
    (BooleanExpression true)
    (BooleanExpression false)
  )
)`,
);

test(
  'Parser recognises const declarations',
  parse,
  'let a = 10',
  `(DeclarationStatement
  LetKeyword
  (IdentifierExpression "a")
  (NumberExpression 10)
)`,
);

test(
  'Parser recognises mutable declarations',
  parse,
  'mut hello = 123',
  `(DeclarationStatement
  MutKeyword
  (IdentifierExpression "hello")
  (NumberExpression 123)
)`,
);

test(
  'Parser recognises fn declarations',
  parseTopLevel,
  'fn add(a: num, b: num) { return a + b }',
  `(FnDeclarationStatement
  (IdentifierExpression "add")
  (FnParameter
    (IdentifierExpression "a")
    (TypeReference
      (IdentifierExpression "num")
    )
  )
  (FnParameter
    (IdentifierExpression "b")
    (TypeReference
      (IdentifierExpression "num")
    )
  )
  (BlockStatement 0
    (ReturnStatement
      (BinaryExpression
        (IdentifierExpression "a")
        (IdentifierExpression "+")
        (IdentifierExpression "b")
      )
    )
  )
)`,
);

test(
  'Parser recognises if statements',
  parseExit,
  'if a < b { return a }',
  `(IfStatement
  (BinaryExpression
    (IdentifierExpression "a")
    (IdentifierExpression "<")
    (IdentifierExpression "b")
  )
  (BlockStatement 0
    (ReturnStatement
      (IdentifierExpression "a")
    )
  )
  (BlockStatement 1
    (GotoStatement
      (BlockStatement 2
      )
    )
  )
)`,
);

test(
  'Parser recognises loop statements',
  parseExit,
  'loop { stop }',
  `(GotoStatement
  (BlockStatement 0
    (GotoStatement
      (BlockStatement 1
      )
    )
  )
)`,
);

test(
  'Parser recognises assignment statements',
  parse,
  'a = 10',
  `(AssignmentStatement
  (IdentifierExpression "a")
  (NumberExpression 10)
)`,
);

test(
  'Parser recognises return statements',
  parseExit,
  'return 10',
  `(ReturnStatement
  (NumberExpression 10)
)`,
);

test(
  'Parser recognises expression statements',
  parse,
  '10',
  `(ExpressionStatement
  (NumberExpression 10)
)`,
);

test(
  'Parser recognises fn calls expressions',
  parse,
  'add(1, 2)',
  `(ExpressionStatement
  (FnCallExpression
    (IdentifierExpression "add")
    (NumberExpression 1)
    (NumberExpression 2)
  )
)`,
);

test(
  'Parser recognises paren expressions',
  parse,
  '(1 + 2)',
  `(ExpressionStatement
  (ParenExpression
    (BinaryExpression
      (NumberExpression 1)
      (IdentifierExpression "+")
      (NumberExpression 2)
    )
  )
)`,
);

// precedence tests
test(
  'Binary precedence puts multiplication above addition',
  parse,
  '1 + 2 * 3 - 4',
  `(ExpressionStatement
  (BinaryExpression
    (BinaryExpression
      (NumberExpression 1)
      (IdentifierExpression "+")
      (BinaryExpression
        (NumberExpression 2)
        (IdentifierExpression "*")
        (NumberExpression 3)
      )
    )
    (IdentifierExpression "-")
    (NumberExpression 4)
  )
)`,
);

// diagnostic tests
test(
  'Parser reports unexpected token diagnostics',
  diagnostics,
  '1 + { 2',
  [DiagnosticCode.UnexpectedToken],
);
