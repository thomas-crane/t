import {
  createToken,
} from './factory';
import {
  DiagnosticCode,
  DiagnosticKind,
  DiagnosticSource,
  DiagnosticType,
  Lexer,
  SyntaxKind,
  TokenSyntaxKind,
} from './types';

interface SyntaxKindMap {
  [key: string]: TokenSyntaxKind;
}

const charMap: SyntaxKindMap = {
  // these are unknown for now, but they exist in the map
  // to allow the system of finding multi character tokens
  // to work properly.
  '&': SyntaxKind.UnknownToken,
  '|': SyntaxKind.UnknownToken,
  '!': SyntaxKind.UnknownToken,

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
  '?': SyntaxKind.QuestionToken,

  '{': SyntaxKind.LeftCurlyToken,
  '}': SyntaxKind.RightCurlyToken,
  '(': SyntaxKind.LeftParenToken,
  ')': SyntaxKind.RightParenToken,
  '[': SyntaxKind.LeftBracketToken,
  ']': SyntaxKind.RightBracketToken,
};

const keywordMap: SyntaxKindMap = {
  num: SyntaxKind.NumKeyword,
  bool: SyntaxKind.BoolKeyword,
  str: SyntaxKind.StrKeyword,
  nil: SyntaxKind.NilKeyword,

  let: SyntaxKind.LetKeyword,
  mut: SyntaxKind.MutKeyword,

  if: SyntaxKind.IfKeyword,
  else: SyntaxKind.ElseKeyword,

  fn: SyntaxKind.FnKeyword,
  return: SyntaxKind.ReturnKeyword,

  loop: SyntaxKind.LoopKeyword,
  stop: SyntaxKind.StopKeyword,

  true: SyntaxKind.TrueKeyword,
  false: SyntaxKind.FalseKeyword,

  struct: SyntaxKind.StructKeyword,
  new: SyntaxKind.NewKeyword,
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
        do {
          pos++;
        } while (!atEnd() && digit.test(src[pos]));
        // TODO(thomas.crane): support floating point numbers.
        return createToken(SyntaxKind.NumberToken, { pos: start, end: pos });
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
        return createToken(SyntaxKind.IdentifierToken, { pos: start, end: pos });
      }

      // strings
      if (src[pos] === `'`) {
        const start = pos;
        let hadError = false;
        let tokenKind = SyntaxKind.StringToken;
        do {
          pos++;
          if (src[pos] === '\n' || atEnd()) {
            diagnostics.push({
              kind: DiagnosticKind.Error,
              error: 'Unterminated string literal.',
              pos: start,
              end: pos,
              source: DiagnosticSource.Lexer,
              code: DiagnosticCode.UnterminatedStringLiteral,
            });
            hadError = true;
            tokenKind = SyntaxKind.UnknownToken;
            break;
          }
        } while (!atEnd() && src[pos] !== `'`);
        if (!hadError) {
          pos++; // skip closing quote.
        }
        const end = pos;
        return createToken(tokenKind, { pos: start, end });
      }

      // misc stuff
      const charStart = pos;
      let char = src[pos++];
      let kind: TokenSyntaxKind = SyntaxKind.UnknownToken;
      if (charMap[char] !== undefined) {
        // see if adding another char results in a recognised token.
        while (!atEnd() && charMap[char + src[pos]] !== undefined) {
          char += src[pos++];
        }
        kind = charMap[char];
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
