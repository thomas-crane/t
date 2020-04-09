import { Printer } from '../../printer';
import { TypeChecker } from '../../typecheck/typechecker';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

export interface StringExpression extends SyntaxNode {
  kind: SyntaxKind.String;
  value: string;
}

export function createStringExpression(
  value: string,
  location?: TextRange,
): StringExpression {
  return setTextRange({
    kind: SyntaxKind.String,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printStringExpression(printer: Printer, node: StringExpression) {
  printer.println(`(StringExpression "${node.value}")`);
}

export function checkStringExpression(checker: TypeChecker, node: StringExpression) {
  node.type = checker.typeTable.get('str');
}
