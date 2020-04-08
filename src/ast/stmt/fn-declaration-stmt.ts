import { Binder } from '../../bind/binder';
import { getAllEnds } from '../../common/block-utils';
import { createLinkedTable } from '../../common/linked-table';
import { DiagnosticCode } from '../../diagnostic/diagnostic-code';
import { createDiagnosticError } from '../../diagnostic/diagnostic-error';
import { DiagnosticSource } from '../../diagnostic/diagnostic-source';
import { DataFlowPass } from '../../flow/data-flow';
import { Printer } from '../../printer';
import { SymbolType } from '../../symbol';
import { createFunctionSymbol, createParameterSymbol, ParameterSymbol } from '../../symbol/function-symbol';
import { Type } from '../../type';
import { TypeKind } from '../../type/type-kind';
import { TypeMatch } from '../../typecheck/type-match';
import { TypeChecker } from '../../typecheck/typechecker';
import { TextRange } from '../../types';
import { setTextRange, typeMatch } from '../../utils';
import { createIdentifierExpression, IdentifierExpression } from '../expr/identifier-expr';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';
import { TypeNode } from '../types';
import { BlockStatement } from './block-stmt';
import { createReturnStatement, ReturnStatement } from './return-stmt';

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
  const existingSymbol = binder.nearestSymbolTable.get(node.fnName.value);
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
    binder.nearestSymbolTable.set(fnSymbol.name, fnSymbol);

    // create a new scope and add the parameters.
    const paramTable = createLinkedTable<string, SymbolType>();
    paramTable.parent = node.body.symbolTable.parent;
    paramSymbols.forEach((param) => paramTable.set(param.name, param));
    node.body.symbolTable.parent = paramTable;
    binder.bindNode(node.body);
    // restore the old scope.
    node.body.symbolTable.parent = paramTable.parent;
  }
}

export function bindFnParameter(binder: Binder, node: FnParameter) {
  if (node.typeNode) {
    binder.bindNode(node.typeNode);
  }
  const paramSymbol = createParameterSymbol(node.name.value, node.name);
  node.name.symbol = paramSymbol;
}

export function checkFnDeclarationStatement(checker: TypeChecker, node: FnDeclarationStatement) {
  // check the params.
  node.params.forEach((param) => checkFnParameter(checker, param));

  // get the expected return type.
  let expectedType: Type | undefined;
  if (node.returnTypeNode !== undefined) {
    checker.checkNode(node.returnTypeNode);
    if (node.returnTypeNode.type === undefined) {
      return;
    }
    expectedType = node.returnTypeNode.type;
    // checker.diagnostics.push(createDiagnosticError(
    //   DiagnosticSource.Checker,
    //   DiagnosticCode.CannotInferType,
    //   'Function return types cannot be inferred',
    //   { pos: node.fnName.pos, end: node.fnName.end },
    // ));
    // return;
  }
  // typecheck each node in the body.
  checker.checkNode(node.body);

  // if there is no expected type, try to infer it
  // by taking the first return type.
  const fnEnds = getAllEnds(node.body);
  if (expectedType === undefined) {
    const firstReturn: BlockStatement | undefined = fnEnds
      .filter((block) => block.exit.kind === SyntaxKind.ReturnStatement)
      .filter((block) => (block.exit as ReturnStatement).value.type !== undefined)[0];

    // if there is still no expected type, it couldn't be inferred.
    if (firstReturn === undefined) {
      checker.diagnostics.push(createDiagnosticError(
        DiagnosticSource.Checker,
        DiagnosticCode.CannotInferType,
        'The return type of this function could not be inferred.',
        { pos: node.fnName.pos, end: node.fnName.end },
      ));
      return;
    } else {
      expectedType = (firstReturn.exit as ReturnStatement).value.type!;
    }
  }

  // check each return end.
  for (const end of fnEnds) {
    switch (end.exit.kind) {
      case SyntaxKind.ReturnStatement:
        const match = typeMatch(end.exit.value.type, expectedType);
        if (match !== TypeMatch.Equal) {
          checker.diagnostics.push(createDiagnosticError(
            DiagnosticSource.Checker,
            DiagnosticCode.UnexpectedType,
            `Expected a value of type ${expectedType.name}`,
            { pos: end.exit.value.pos, end: end.exit.value.end },
          ));
        }
        break;
      case SyntaxKind.BlockEnd:
        // if the return type is nil, we can insert an implicit
        // return nil.
        if (expectedType.kind === TypeKind.Nil) {
          const nil = end.symbolTable.get('nil');
          if (nil === undefined) {
            return;
          }
          const nilName = createIdentifierExpression('nil');
          nilName.symbol = nil;
          nil.references.push(nilName);
          nilName.flags |= SyntaxNodeFlags.Synthetic;
          const implicitReturn = createReturnStatement(nilName);
          implicitReturn.flags |= SyntaxNodeFlags.Synthetic;
          end.exit = implicitReturn;
        } else {
          // otherwise this path does not return.
          checker.diagnostics.push(createDiagnosticError(
            DiagnosticSource.Checker,
            DiagnosticCode.UnexpectedType,
            'Not all code paths return a value.',
            { pos: node.fnName.pos, end: node.fnName.end },
          ));
        }
    }
  }

  // set the current fn and check the body, then unset it.
  checker.currentFn = node;
  checker.checkNode(node.body);
  checker.currentFn = undefined;
}

export function checkFnParameter(checker: TypeChecker, node: FnParameter) {
  if (node.typeNode === undefined) {
    checker.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Checker,
      DiagnosticCode.CannotInferType,
      'Parameter types cannot be inferred',
      { pos: node.name.pos, end: node.name.end },
    ));
    return;
  }
  checker.checkNode(node.typeNode);
  node.name.type = node.typeNode.type;
}

export function dataFlowFnDeclarationStatement(pass: DataFlowPass, node: FnDeclarationStatement) {
  pass.visitNode(node.body);
}
