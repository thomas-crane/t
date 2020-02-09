import test, { ExecutionContext } from 'ava';
import { createToken } from './factory';
import { createLexer } from './lexer';
import { DiagnosticCode, DiagnosticKind, SyntaxKind, SyntaxToken, TokenSyntaxKind } from './types';

const keywords: Array<[string, SyntaxToken<TokenSyntaxKind>]> = [
  ['let', createToken(SyntaxKind.LetKeyword)],
  ['mut', createToken(SyntaxKind.MutKeyword)],

  ['if', createToken(SyntaxKind.IfKeyword)],
  ['else', createToken(SyntaxKind.ElseKeyword)],

  ['fn', createToken(SyntaxKind.FnKeyword)],
  ['return', createToken(SyntaxKind.ReturnKeyword)],

  ['loop', createToken(SyntaxKind.LoopKeyword)],
  ['stop', createToken(SyntaxKind.StopKeyword)],

  ['true', createToken(SyntaxKind.TrueKeyword)],
  ['false', createToken(SyntaxKind.FalseKeyword)],

  ['num', createToken(SyntaxKind.NumKeyword)],
  ['bool', createToken(SyntaxKind.BoolKeyword)],
  ['str', createToken(SyntaxKind.StrKeyword)],
  ['nil', createToken(SyntaxKind.NilKeyword)],

  ['struct', createToken(SyntaxKind.StructKeyword)],
  ['new', createToken(SyntaxKind.NewKeyword)],
];

function tokens(input: string) {
  const lexer = createLexer(input);
  const result: Array<SyntaxToken<any>> = [];
  let token: SyntaxToken<any>;
  do {
    token = lexer.nextToken();
    result.push(token);
  } while (token.kind !== SyntaxKind.EndOfFileToken);
  return result;
}

function nextToken(t: ExecutionContext, input: string, expected: SyntaxToken<TokenSyntaxKind>) {
  const [next] = tokens(input);
  t.deepEqual(next, expected);
}

function allTokens(t: ExecutionContext, input: string, expected: SyntaxKind[]) {
  const result = tokens(input).slice(0, -1).map((x) => x.kind);
  t.deepEqual(result, expected);
}

test('Lexer recognises numbers', nextToken, '10', createToken(SyntaxKind.NumberToken, { pos: 0, end: 2 }));
test('Lexer recognises identifiers', nextToken, 'hello', createToken(SyntaxKind.IdentifierToken, { pos: 0, end: 5 }));
test(
  'Lexer recognises string literals',
  nextToken,
  `'hello, world!'`,
  createToken(SyntaxKind.StringToken, { pos: 0, end: 15 }),
);

for (const [keyword, kind] of keywords) {
  test(`Lexer recognises the keyword "${keyword}"`, nextToken, keyword, { ...kind, pos: 0, end: keyword.length });
}

test('Lexer recognises several tokens in a row', allTokens, 'hello 10 + - (  } )', [
  SyntaxKind.IdentifierToken,
  SyntaxKind.NumberToken,
  SyntaxKind.PlusToken,
  SyntaxKind.MinusToken,
  SyntaxKind.LeftParenToken,
  SyntaxKind.RightCurlyToken,
  SyntaxKind.RightParenToken,
]);
test('Lexer always returns EOF when the stream is empty', (t) => {
  const lexer = createLexer('');
  const result = [lexer.nextToken(), lexer.nextToken(), lexer.nextToken()].map((x) => x.kind);
  t.deepEqual(result, [SyntaxKind.EndOfFileToken, SyntaxKind.EndOfFileToken, SyntaxKind.EndOfFileToken]);
});

test('Lexer reports diagnostics for unknown tokens', (t) => {
  const unknownText = '🤔';
  const lexer = createLexer(unknownText);
  lexer.nextToken();
  const [diagnostic] = lexer.getDiagnostics();
  t.is(diagnostic.kind, DiagnosticKind.Error);
  t.is(diagnostic.code, DiagnosticCode.UnknownToken);
});
test('Lexer reports a diagnostic for string literals that span multiple lines.', (t) => {
  const lexer = createLexer(`'hello\nworld`);
  lexer.nextToken();
  const [diagnostic] = lexer.getDiagnostics();
  t.is(diagnostic.kind, DiagnosticKind.Error);
  t.is(diagnostic.code, DiagnosticCode.UnterminatedStringLiteral);
});
test('Lexer reports a diagnostic for string literals that are unterminated.', (t) => {
  const lexer = createLexer(`'hello world`);
  lexer.nextToken();
  const [diagnostic] = lexer.getDiagnostics();
  t.is(diagnostic.kind, DiagnosticKind.Error);
  t.is(diagnostic.code, DiagnosticCode.UnterminatedStringLiteral);
});

test('Lexer recognises multi character tokens.', allTokens, '== != && ||', [
  SyntaxKind.EqualTo,
  SyntaxKind.NotEqualTo,
  SyntaxKind.LogicalAnd,
  SyntaxKind.LogicalOr,
]);
