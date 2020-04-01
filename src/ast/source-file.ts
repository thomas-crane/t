import { Binder } from '../bind/binder';
import { DiagnosticType } from '../diagnostic';
import { Printer } from '../printer';
import { StatementNode } from './stmt';
import { registerStructName, StructDeclStatement } from './stmt/struct-decl-stmt';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from './syntax-node';

/**
 * A top level node which contains the list of statements in a program,
 * and some information about the file which the statements came from.
 */
export interface SourceFile extends SyntaxNode {
  kind: SyntaxKind.SourceFile;
  statements: StatementNode[];
  text: string;
  fileName: string;

  diagnostics: DiagnosticType[];
}

export function createSourceFile(
  statements: StatementNode[],
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
