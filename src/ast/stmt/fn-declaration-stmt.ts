import { Binder } from '../../bind/binder';
import { DiagnosticCode } from '../../diagnostic/diagnostic-code';
import { createDiagnosticError } from '../../diagnostic/diagnostic-error';
import { DiagnosticSource } from '../../diagnostic/diagnostic-source';
import { Printer } from '../../printer';
import { createFunctionSymbol, createParameterSymbol, ParameterSymbol } from '../../symbol/function-symbol';
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

export function bindFnDeclarationStatement(binder: Binder, node: FnDeclarationStatement) {
  const existingSymbol = binder.valueSymbolTable.get(node.fnName.value);
  if (existingSymbol !== undefined) {
    binder.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Binder,
      DiagnosticCode.DuplicateSymbol,
      `Duplicate identifier "${existingSymbol.name}"`,
      { pos: node.fnName.pos, end: node.fnName.end },
    ));
    node.flags |= SyntaxNodeFlags.HasErrors;
  } else {
    if (node.returnTypeNode) {
      binder.bindNode(node.returnTypeNode);
    }
    // bind params
    node.params.forEach((param) => bindFnParameter(binder, param));
    const paramSymbols = node.params.map((param) => param.name.symbol as ParameterSymbol);

    // create the fn symbol and add it to the scope.
    const fnSymbol = createFunctionSymbol(node.fnName.value, paramSymbols, node);
    node.fnName.symbol = fnSymbol;
    binder.valueSymbolTable.set(fnSymbol.name, fnSymbol);

    // create a new scope and add the parameters.
    binder.valueSymbolTable.pushScope();
    paramSymbols.forEach((param) => binder.valueSymbolTable.set(param.name, param));
    // bind each statement in the fn body. We don't want
    // to bind it as a block statement because this will
    // add another scope level unnecessarily.
    node.body.statements.forEach((stmt) => binder.bindNode(stmt));
    binder.valueSymbolTable.popScope();
  }
}

export function bindFnParameter(binder: Binder, node: FnParameter) {
  if (node.typeNode) {
    binder.bindNode(node.typeNode);
  }
  const paramSymbol = createParameterSymbol(node.name.value, node.name);
  node.name.symbol = paramSymbol;
}
