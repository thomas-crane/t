import { Binder } from '../bind/binder';
import { DiagnosticType } from '../diagnostic';
import { DataFlowPass } from '../flow/data-flow';
import { Printer } from '../printer';
import { TypeChecker } from '../typecheck/typechecker';
import { FnDeclarationStatement } from './stmt/fn-declaration-stmt';
import { registerStructName, registerStructType, StructDeclStatement } from './stmt/struct-decl-stmt';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from './syntax-node';

export type TopLevelStatement
  = FnDeclarationStatement
  | StructDeclStatement
  ;

/**
 * A top level node which contains the list of statements in a program,
 * and some information about the file which the statements came from.
 */
export interface SourceFile extends SyntaxNode {
  kind: SyntaxKind.SourceFile;
  statements: TopLevelStatement[];
  text: string;
  fileName: string;

  diagnostics: DiagnosticType[];
}

export function createSourceFile(
  statements: TopLevelStatement[],
  text: string,
  fileName: string,
  diagnostics?: DiagnosticType[],
): SourceFile {
  if (!diagnostics) {
    diagnostics = [];
  }
  return {
    kind: SyntaxKind.SourceFile,
    statements,
    text,
    fileName,
    flags: SyntaxNodeFlags.None,
    diagnostics,
    pos: 0,
    end: text.length - 1,
  };
}

export function printSourceFile(printer: Printer, node: SourceFile) {
  printer.indent('(SourceFile');
  node.statements.forEach((stmt) => printer.printNode(stmt));
  printer.dedent(')');
}

export function bindSourceFile(binder: Binder, node: SourceFile) {
  // register the struct names first.
  node.statements
    .filter((stmt) => stmt.kind === SyntaxKind.StructDeclStatement)
    .forEach((stmt) => registerStructName(binder, stmt as StructDeclStatement));
  // then bind everything.
  node.statements.forEach((stmt) => binder.bindNode(stmt));
}

export function checkSourceFile(checker: TypeChecker, node: SourceFile) {
  // register struct types first.
  node.statements
    .filter((stmt) => stmt.kind === SyntaxKind.StructDeclStatement)
    .forEach((stmt) => registerStructType(checker, stmt as StructDeclStatement));
  // then check everything.
  node.statements.forEach((stmt) => checker.checkNode(stmt));
}

export function dataFlowSourceFile(pass: DataFlowPass, node: SourceFile) {
  for (const stmt of node.statements) {
    switch (stmt.kind) {
      case SyntaxKind.FnDeclarationStatement:
        pass.visitNode(stmt);
        break;
    }
  }
}
