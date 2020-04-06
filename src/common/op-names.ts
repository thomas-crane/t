import { SyntaxKind } from '../ast/syntax-node';
import { BinaryOperator, UnaryOperator } from '../ast/token';

export const binaryOpName: Readonly<Record<BinaryOperator, string>> = {
  [SyntaxKind.PlusToken]: '+',
  [SyntaxKind.MinusToken]: '-',
  [SyntaxKind.StarToken]: '*',
  [SyntaxKind.SlashToken]: '/',
  [SyntaxKind.LessThan]: '<',
  [SyntaxKind.GreaterThan]: '>',
  [SyntaxKind.EqualTo]: '==',
  [SyntaxKind.NotEqualTo]: '!=',
  [SyntaxKind.LogicalAnd]: '&&',
  [SyntaxKind.LogicalOr]: '||',
};

export const unaryOpName: Readonly<Record<UnaryOperator, string>> = {
  [SyntaxKind.PlusToken]: '+',
  [SyntaxKind.MinusToken]: '-',
  [SyntaxKind.ExclamationToken]: '!',
};
