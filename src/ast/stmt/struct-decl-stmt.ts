import { Binder } from '../../bind/binder';
import { DiagnosticCode } from '../../diagnostic/diagnostic-code';
import { createDiagnosticError } from '../../diagnostic/diagnostic-error';
import { DiagnosticSource } from '../../diagnostic/diagnostic-source';
import { Printer } from '../../printer';
import { createStructMemberSymbol, createStructSymbol } from '../../symbol/struct-symbol';
import { SymbolKind } from '../../symbol/symbol-kind';
import { createStructType, StructType } from '../../type/struct-type';
import { TypeKind } from '../../type/type-kind';
import { TypeChecker } from '../../typecheck/typechecker';
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

export function registerStructType(checker: TypeChecker, node: StructDeclStatement) {
  // check for an existing struct type.
  const existingType = checker.typeTable.get(node.name.value);
  // a diagnostic will already have been reported for
  // the duplicate, so just don't register the name.
  if (existingType !== undefined) {
    return;
  }

  // add the struct type to the type table.
  const structType = createStructType(node.name.value, {});
  node.name.type = structType;
  checker.typeTable.set(structType.name, structType);
}

export function checkStructDeclStatement(checker: TypeChecker, node: StructDeclStatement) {
  const structType = node.name.type as StructType | undefined;
  if (structType === undefined) {
    return;
  }

  // check the type of each member of the struct. We also
  // need to make sure this member will not write over an
  // existing field, and we shouls copy it into the fields.
  // tslint:disable-next-line: forin
  for (const name in node.members) {
    checkStructMember(checker, node.members[name]);
    if (structType.fields[name] !== undefined) {
      checker.diagnostics.push(createDiagnosticError(
        DiagnosticSource.Checker,
        DiagnosticCode.DuplicateSymbol,
        `The struct "${structType.name}" already contains a field called "${name}"`,
        { pos: node.name.pos, end: node.name.end },
      ));
      continue;
    }
    if (node.members[name].type !== undefined) {
      structType.fields[name] = node.members[name].type!;
    }
  }

  // check if the struct is recursively defined.
  if (checkStructRecursion(structType)) {
    checker.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Checker,
      DiagnosticCode.RecursiveStruct,
      `The struct "${structType.name}" is recursively defined.`,
      { pos: node.name.pos, end: node.name.end },
    ));
  }
}

export function checkStructMember(checker: TypeChecker, node: StructMember) {
  if (node.typeNode === undefined) {
    checker.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Checker,
      DiagnosticCode.CannotInferType,
      'Cannot infer the type of a struct field.',
      { pos: node.name.pos, end: node.name.end },
    ));
    return;
  }
  checker.checkNode(node.typeNode);
  node.type = node.typeNode.type;
}

/**
 * Determines whether or not the given struct is either directly
 * or mutually recursively defined.
 */
export function checkStructRecursion(struct: StructType): boolean {
  function checkChildren(parent: StructType): boolean {
    for (const name in parent.members) {
      if (parent.members[name]?.kind === TypeKind.Struct) {
        if (parent.members[name] === struct) {
          return true;
        } else {
          return checkChildren(parent.members[name] as StructType);
        }
      }
    }
    return false;
  }
  return checkChildren(struct);
}
