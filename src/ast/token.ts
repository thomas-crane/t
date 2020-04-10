import { TextRange } from '../types';
import { setTextRange } from '../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from './syntax-node';

/**
 * A token. This can include single characters, operators and keywords.
 */
export interface SyntaxToken<TokenKind extends TokenSyntaxKind> extends SyntaxNode {
  kind: TokenKind;
}

export type TokenSyntaxKind
  = SyntaxKind.EndOfFileToken
  | SyntaxKind.UnknownToken
  | SyntaxKind.Comment
  | SyntaxKind.StructKeyword
  | SyntaxKind.PlusToken
  | SyntaxKind.MinusToken
  | SyntaxKind.StarToken
  | SyntaxKind.SlashToken
  | SyntaxKind.EqualsToken
  | SyntaxKind.CommaToken
  | SyntaxKind.ColonToken
  | SyntaxKind.DotToken
  | SyntaxKind.QuestionToken
  | SyntaxKind.ExclamationToken
  | SyntaxKind.LeftCurlyToken
  | SyntaxKind.RightCurlyToken
  | SyntaxKind.LeftParenToken
  | SyntaxKind.RightParenToken
  | SyntaxKind.LeftBracketToken
  | SyntaxKind.RightBracketToken
  | SyntaxKind.LessThan
  | SyntaxKind.GreaterThan
  | SyntaxKind.EqualTo
  | SyntaxKind.NotEqualTo
  | SyntaxKind.LogicalAnd
  | SyntaxKind.LogicalOr
  | SyntaxKind.LetKeyword
  | SyntaxKind.MutKeyword
  | SyntaxKind.IfKeyword
  | SyntaxKind.ElseKeyword
  | SyntaxKind.FnKeyword
  | SyntaxKind.ReturnKeyword
  | SyntaxKind.LoopKeyword
  | SyntaxKind.StopKeyword
  | SyntaxKind.TrueKeyword
  | SyntaxKind.FalseKeyword
  | SyntaxKind.NumberToken
  | SyntaxKind.IdentifierToken
  | SyntaxKind.StringToken
  | SyntaxKind.StructKeyword
  | SyntaxKind.NewKeyword
  ;

/**
 * The set of syntax tokens which are valid binary expression operators.
 */
export type BinaryOperator
  = SyntaxKind.PlusToken
  | SyntaxKind.MinusToken
  | SyntaxKind.StarToken
  | SyntaxKind.SlashToken
  | SyntaxKind.LessThan
  | SyntaxKind.GreaterThan
  | SyntaxKind.EqualTo
  | SyntaxKind.NotEqualTo
  | SyntaxKind.LogicalAnd
  | SyntaxKind.LogicalOr
  ;
/**
 * The set of syntax tokens which are valid unary expression operators.
 */
export type UnaryOperator
  = SyntaxKind.PlusToken
  | SyntaxKind.MinusToken
  | SyntaxKind.ExclamationToken
  ;

export function createToken<T extends TokenSyntaxKind>(
  tokenKind: T,
  location?: TextRange,
): SyntaxToken<T> {
  return setTextRange({
    kind: tokenKind,
    flags: SyntaxNodeFlags.None,
  }, location);
}
