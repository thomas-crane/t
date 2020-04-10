import { SyntaxKind } from './ast/syntax-node';
import { createToken, SyntaxToken, TokenSyntaxKind } from './ast/token';
import { DiagnosticType } from './diagnostic';
import { DiagnosticCode } from './diagnostic/diagnostic-code';
import { createDiagnosticError } from './diagnostic/diagnostic-error';
import { DiagnosticSource } from './diagnostic/diagnostic-source';

/**
 * An interface for turning some text into a stream of tokens.
 */
export interface Lexer {
  nextToken(): SyntaxToken<TokenSyntaxKind>;
  getDiagnostics(): DiagnosticType[];
}

interface SyntaxKindMap {
  [key: string]: TokenSyntaxKind;
}

const charMap: SyntaxKindMap = {
  // these are unknown for now, but they exist in the map
  // to allow the system of finding multi character tokens
  // to work properly.
  '&': SyntaxKind.UnknownToken,
  '|': SyntaxKind.UnknownToken,

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
  '.': SyntaxKind.DotToken,
  '?': SyntaxKind.QuestionToken,
  '!': SyntaxKind.ExclamationToken,

  '{': SyntaxKind.LeftCurlyToken,
  '}': SyntaxKind.RightCurlyToken,
  '(': SyntaxKind.LeftParenToken,
  ')': SyntaxKind.RightParenToken,
  '[': SyntaxKind.LeftBracketToken,
  ']': SyntaxKind.RightBracketToken,
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

      // comments
      if (src[pos] === '#') {
        // consume until the end of the line.
        const start = pos;
        do {
          pos++;
        } while (!atEnd() && src[pos] !== '\n');
        // skip the newline.
        pos++;
        return createToken(SyntaxKind.Comment, { pos: start, end: pos });
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
            diagnostics.push(createDiagnosticError(
              DiagnosticSource.Lexer,
              DiagnosticCode.UnterminatedStringLiteral,
              'Unterminated string literal.',
              { pos: start, end: pos },
            ));
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
        diagnostics.push(createDiagnosticError(
          DiagnosticSource.Lexer,
          DiagnosticCode.UnknownToken,
          `Unknown character "${char}"`,
          { pos: charStart, end: pos },
        ));
      }
      return createToken(kind, { pos: charStart, end: pos });
    },
  };
}
