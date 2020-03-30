import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { ExpressionNode } from '../expr';
import { IdentifierExpression } from '../expr/identifier-expr';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';
import { TypeNode } from '../types';

/**
 * A variable declaration statement. This encompasses
 * both mutable and immutable assignments.
 */
export interface DeclarationStatement extends SyntaxNode {
  kind: SyntaxKind.DeclarationStatement;

  isConst: boolean;
  identifier: IdentifierExpression;
  typeNode?: TypeNode;
  value: ExpressionNode;
}

export function createDeclarationStatement(
  isConst: boolean,
  identifier: IdentifierExpression,
  typeNode: TypeNode | undefined,
  value: ExpressionNode,
  location?: TextRange,
): DeclarationStatement {
  return setTextRange({
    kind: SyntaxKind.DeclarationStatement,
    isConst,
    identifier,
    typeNode,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printDeclarationStatement(printer: Printer, node: DeclarationStatement) {
  printer.indent('(DeclarationStatement');
  if (node.isConst) {
    printer.println('LetKeyword');
  } else {
    printer.println('MutKeyword');
  }
  printer.printNode(node.identifier);
  if (node.typeNode) {
    printer.printNode(node.typeNode);
  }
  printer.printNode(node.value);
  printer.dedent(')');
}
