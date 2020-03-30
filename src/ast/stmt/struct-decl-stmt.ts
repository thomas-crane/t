import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { IdentifierExpression } from '../expr/identifier-expr';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';
import { TypeNode } from '../types';

export interface StructDeclStatement extends SyntaxNode {
  kind: SyntaxKind.StructDeclStatement;

  name: IdentifierExpression;
  members: Record<string, StructMember>;
}

export interface StructMember extends SyntaxNode {
  kind: SyntaxKind.StructMember;

  isConst: boolean;
  name: IdentifierExpression;
  typeNode?: TypeNode;
}

export function createStructDeclStatement(
  name: IdentifierExpression,
  members: StructDeclStatement['members'],
  location?: TextRange,
): StructDeclStatement {
  return setTextRange({
    kind: SyntaxKind.StructDeclStatement,
    name,
    members,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createStructMember(
  isConst: boolean,
  name: IdentifierExpression,
  typeNode: TypeNode | undefined,
  location?: TextRange,
): StructMember {
  return setTextRange({
    kind: SyntaxKind.StructMember,
    isConst,
    name,
    typeNode,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printStructDeclStatement(printer: Printer, node: StructDeclStatement) {
  printer.indent('(StructDeclStatement');
  printer.printNode(node.name);
  // tslint:disable-next-line: forin
  for (const name in node.members) {
    printStructMember(printer, node.members[name]);
  }
  printer.dedent(')');
}

export function printStructMember(printer: Printer, node: StructMember) {
  printer.indent('(StructMember');
  if (!node.isConst) {
    printer.println('(MutKeyword)');
  }
  printer.printNode(node.name);
  if (node.typeNode) {
    printer.printNode(node.typeNode);
  }
  printer.dedent(')');
}
