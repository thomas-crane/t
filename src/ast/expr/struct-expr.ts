import { ExpressionNode } from '.';
import { Binder } from '../../bind/binder';
import { DiagnosticCode } from '../../diagnostic/diagnostic-code';
import { createDiagnosticError } from '../../diagnostic/diagnostic-error';
import { DiagnosticSource } from '../../diagnostic/diagnostic-source';
import { Printer } from '../../printer';
import { SymbolKind } from '../../symbol/symbol-kind';
import { TextRange } from '../../types';
import { setTextRange } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';
import { IdentifierExpression } from './identifier-expr';

export interface StructExpression extends SyntaxNode {
  kind: SyntaxKind.StructExpression;

  name: IdentifierExpression;
  members: Record<string, StructMemberExpression>;
}

export interface StructMemberExpression extends SyntaxNode {
  kind: SyntaxKind.StructMemberExpression;

  name: IdentifierExpression;
  value: ExpressionNode;
}

export function createStructExpression(
  name: IdentifierExpression,
  members: StructExpression['members'],
  location?: TextRange,
): StructExpression {
  return setTextRange({
    kind: SyntaxKind.StructExpression,
    name,
    members,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function createStructMemberExpression(
  name: IdentifierExpression,
  value: ExpressionNode,
  location?: TextRange,
): StructMemberExpression {
  return setTextRange({
    kind: SyntaxKind.StructMemberExpression,
    name,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printStructExpression(printer: Printer, node: StructExpression) {
  printer.indent('(StructExpression');
  printer.printNode(node.name);
  // tslint:disable-next-line: forin
  for (const name in node.members) {
    printStructMemberExpression(printer, node.members[name]);
  }
  printer.dedent(')');
}

export function printStructMemberExpression(printer: Printer, node: StructMemberExpression) {
  printer.indent('(StructMemberExpression');
  printer.printNode(node.name);
  printer.printNode(node.value);
  printer.dedent(')');
}

export function bindStructExpression(binder: Binder, node: StructExpression) {
  const structSymbol = binder.typeSymbolTable.get(node.name.value);
  if (structSymbol === undefined || structSymbol.kind !== SymbolKind.Struct) {
    binder.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Binder,
      DiagnosticCode.UnknownSymbol,
      `Cannot find name "${node.name.value}"`,
      { pos: node.name.pos, end: node.name.end },
    ));
    // if name does not refer to a struct, diagnostics
    // will be reported in the typechecking stage.
    node.flags |= SyntaxNodeFlags.HasErrors;
    return;
  }
  node.name.symbol = structSymbol;
  structSymbol.references.push(node.name);
  // tslint:disable-next-line: forin
  for (const name in node.members) {
    bindStructMemberExpression(binder, node.members[name]);
  }
}

export function bindStructMemberExpression(binder: Binder, node: StructMemberExpression) {
  // checking whether or not this member is actually part
  // of the struct happens during typechecking, so just
  // bind the value here and move on.
  binder.bindNode(node.value);
}
