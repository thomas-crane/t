import { SyntaxKind } from '../ast/syntax-node';
import { BinaryOperator, UnaryOperator } from '../ast/token';

export function binaryOpToString(op: BinaryOperator): string {
  switch (op.kind) {
    case SyntaxKind.PlusToken:
      return '+';
    case SyntaxKind.MinusToken:
      return '-';
    case SyntaxKind.StarToken:
      return '*';
    case SyntaxKind.SlashToken:
      return '/';
    case SyntaxKind.LessThan:
      return '<';
    case SyntaxKind.GreaterThan:
      return '>';
    case SyntaxKind.EqualTo:
      return '==';
    case SyntaxKind.NotEqualTo:
      return '!=';
    case SyntaxKind.LogicalAnd:
      return '&&';
    case SyntaxKind.LogicalOr:
      return '||';
  }
}

export function unaryOpToString(op: UnaryOperator): string {
  switch (op.kind) {
    case SyntaxKind.PlusToken:
      return '+';
    case SyntaxKind.MinusToken:
      return '-';
    case SyntaxKind.ExclamationToken:
      return '!';
  }
}
