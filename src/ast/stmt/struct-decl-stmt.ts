import { Binder } from '../../bind/binder';
import { DiagnosticCode } from '../../diagnostic/diagnostic-code';
import { createDiagnosticError } from '../../diagnostic/diagnostic-error';
import { DiagnosticSource } from '../../diagnostic/diagnostic-source';
import { Printer } from '../../printer';
import { createStructMemberSymbol, createStructSymbol } from '../../symbol/struct-symbol';
import { SymbolKind } from '../../symbol/symbol-kind';
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

export function bindStructDeclStatement(binder: Binder, node: StructDeclStatement) {
  // get the registered struct name.
  const structSymbol = node.name.symbol;
  if (structSymbol === undefined || structSymbol.kind !== SymbolKind.Struct) {
    throw new Error(`Struct ${node.name.value} was not bound correctly`);
  }
  // bind the members.
  // tslint:disable-next-line: forin
  for (const name in node.members) {
    const memberNode = node.members[name];
    if (memberNode.typeNode) {
      binder.bindNode(memberNode.typeNode);
    }
    const memberSymbol = createStructMemberSymbol(
      memberNode.name.value,
      memberNode.isConst,
      structSymbol,
      memberNode,
    );
    memberNode.name.symbol = memberSymbol;
    structSymbol.members[name] = memberSymbol;
  }
}

export function registerStructName(binder: Binder, node: StructDeclStatement) {
  // check for an existing struct.
  const existingSymbol = binder.typeSymbolTable.get(node.name.value);
  if (existingSymbol !== undefined) {
    binder.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Binder,
      DiagnosticCode.DuplicateSymbol,
      `Duplicate identifier "${existingSymbol.name}"`,
      { pos: node.name.pos, end: node.name.end },
    ));
    node.flags |= SyntaxNodeFlags.HasErrors;
  } else {
    const structSymbol = createStructSymbol(node.name.value, {}, node);
    node.name.symbol = structSymbol;
    binder.typeSymbolTable.set(structSymbol.name, structSymbol);
  }
}
