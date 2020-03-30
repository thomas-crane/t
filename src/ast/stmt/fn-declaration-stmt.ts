import { Printer } from '../../printer';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { IdentifierExpression } from '../expr/identifier-expr';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';
import { TypeNode } from '../types';
import { BlockStatement } from './block-stmt';

/**
 * A function declaration statement.
 */
export interface FnDeclarationStatement extends SyntaxNode {
  kind: SyntaxKind.FnDeclarationStatement;

  fnName: IdentifierExpression;
  params: FnParameter[];
  returnTypeNode?: TypeNode;
  body: BlockStatement;
}

/**
 * A function parameter.
 */
export interface FnParameter extends SyntaxNode {
  kind: SyntaxKind.FnParameter;

  name: IdentifierExpression;
  typeNode?: TypeNode;
}

export function createFnDeclarationStatement(
  fnName: IdentifierExpression,
  params: FnParameter[],
  returnTypeNode: TypeNode | undefined,
  body: BlockStatement,
  location?: TextRange,
): FnDeclarationStatement {
  return setTextRange({
    kind: SyntaxKind.FnDeclarationStatement,
    fnName,
    params,
    returnTypeNode,
    body,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createFnParameter(
  name: IdentifierExpression,
  typeNode: TypeNode | undefined,
  location?: TextRange,
): FnParameter {
  return setTextRange({
    kind: SyntaxKind.FnParameter,
    name,
    typeNode,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printFnDeclarationStatement(printer: Printer, node: FnDeclarationStatement) {
  printer.indent('(FnDeclarationStatement');
  printer.printNode(node.fnName);
  node.params.forEach((param) => printFnParameter(printer, param));
  if (node.returnTypeNode) {
    printer.printNode(node.returnTypeNode);
  }
  printer.printNode(node.body);
  printer.dedent(')');
}

export function printFnParameter(printer: Printer, node: FnParameter) {
  printer.indent('(FnParameter');
  printer.printNode(node.name);
  if (node.typeNode) {
    printer.printNode(node.typeNode);
  }
  printer.dedent(')');
}
