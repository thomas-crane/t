import { createIdentifier, createNumberLiteral, createToken } from './factory';
import { DiagnosticCode, DiagnosticKind, DiagnosticSource, DiagnosticType, Lexer, SyntaxKind, TokenSyntaxKind } from './types';

type SyntaxKindMap = { [key: string]: TokenSyntaxKind };

const charMap: SyntaxKindMap = {
  '+': SyntaxKind.PlusToken,
  '-': SyntaxKind.MinusToken,
  '/': SyntaxKind.SlashToken,
  '*': SyntaxKind.StarToken,

  '<': SyntaxKind.LessThan,
  '>': SyntaxKind.GreaterThan,
  '==': SyntaxKind.EqualTo,
  '!=': SyntaxKind.NotEqualTo,

  '&&': SyntaxKind.LogicalAnd,
  '||': SyntaxKind.LogicalOr,

  '=': SyntaxKind.EqualsToken,
  ',': SyntaxKind.CommaToken,
  ':': SyntaxKind.ColonToken,

  '{': SyntaxKind.LeftCurlyToken,
  '}': SyntaxKind.RightCurlyToken,
  '(': SyntaxKind.LeftParenToken,
  ')': SyntaxKind.RightParenToken,
};

const keywordMap: SyntaxKindMap = {
  let: SyntaxKind.LetKeyword,
  mut: SyntaxKind.MutKeyword,

  if: SyntaxKind.IfKeyword,
  else: SyntaxKind.ElseKeyword,

  fn: SyntaxKind.FnKeyword,
  return: SyntaxKind.ReturnKeyword,

  loop: SyntaxKind.LoopKeyword,
  stop: SyntaxKind.StopKeyword,
};

const whitespace = /\s/;
const digit = /[0-9]/;
const idHead = /[A-Za-z_]/;
const idBody = /[A-Za-z0-9_]/;

export function createLexer(src: string): Lexer {
  const diagnostics: DiagnosticType[] = [];
  let pos = 0;

  function atEnd(): boolean {
    return pos === src.length;
  }

  return {
    getDiagnostics: () => diagnostics,
    nextToken() {
      while (!atEnd() && whitespace.test(src[pos])) {
        pos++;
      }
      if (atEnd()) {
        return createToken(SyntaxKind.EndOfFileToken, { pos, end: pos });
      }

      // numbers
      if (digit.test(src[pos])) {
        const start = pos;
        let buf = '';
        do {
          buf += src[pos];
          pos++;
        } while (!atEnd() && digit.test(src[pos]));
        // TODO(thomas.crane): support floating point numbers.
        return createNumberLiteral(parseInt(buf, 10), { pos: start, end: pos });
      }

      // identifiers
      if (idHead.test(src[pos])) {
        const start = pos;
        let buf = '';
        do {
          buf += src[pos];
          pos++;
        } while (!atEnd() && idBody.test(src[pos]));
        // keywords
        if (keywordMap[buf]) {
          return createToken(keywordMap[buf], { pos: start, end: pos });
        }
        return createIdentifier(buf, { pos: start, end: pos });
      }

      // misc stuff
      const charStart = pos;
      const char = src[pos++];
      let kind: TokenSyntaxKind = SyntaxKind.UnknownToken;
      if (charMap[char]) {
        // check for double chars.
        switch (char) {
          case '!':
            if (src[pos] === '=') {
              kind = SyntaxKind.NotEqualTo;
              pos++;
            }
            break;
          case '=':
            if (src[pos] === '=') {
              kind = SyntaxKind.EqualTo;
              pos++;
            }
            break;
          default:
            kind = charMap[char];
            break;
        }
      }
      if (kind === SyntaxKind.UnknownToken) {
        diagnostics.push({
          kind: DiagnosticKind.Error,
          error: `Unknown character "${char}"`,
          pos: charStart,
          end: pos,
          source: DiagnosticSource.Lexer,
          code: DiagnosticCode.UnknownToken,
        });
      }
      return createToken(kind, { pos: charStart, end: pos });
    },
  };
}
