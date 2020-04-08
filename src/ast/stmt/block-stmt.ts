import { StatementNode } from '.';
import { Binder } from '../../bind/binder';
import { globalValueTable } from '../../bind/global-symbol-table';
import { createLinkedTable, LinkedTable } from '../../common/linked-table';
import { DiagnosticCode } from '../../diagnostic/diagnostic-code';
import { DiagnosticSource } from '../../diagnostic/diagnostic-source';
import { createDiagnosticWarning } from '../../diagnostic/diagnostic-warning';
import { DataFlowPass } from '../../flow/data-flow';
import { Printer } from '../../printer';
import { SymbolType } from '../../symbol';
import { SymbolKind } from '../../symbol/symbol-kind';
import { TypeChecker } from '../../typecheck/typechecker';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';
import { BlockEnd, BlockEndKind, createBlockEnd } from './block-end';
import { GotoStatement } from './goto-stmt';
import { IfStatement } from './if-stmt';
import { ReturnStatement } from './return-stmt';

export type BlockExit
  = ReturnStatement
  | IfStatement
  | GotoStatement
  | BlockEnd
  ;

export function isBlockExit(node: SyntaxNode): node is BlockExit {
  switch (node.kind) {
    case SyntaxKind.ReturnStatement:
    case SyntaxKind.IfStatement:
    case SyntaxKind.GotoStatement:
    case SyntaxKind.BlockEnd:
      return true;
    default:
      return false;
  }
}

/**
 * A list of statements.
 */
export interface BlockStatement extends SyntaxNode {
  kind: SyntaxKind.BlockStatement;

  statements: StatementNode[];
  exit: BlockExit;
  afterExit: StatementNode[];

  symbolTable: LinkedTable<string, SymbolType>;
}

export function createBlockStatement(): BlockStatement {
  // create a block end as the exit for this block.
  const blockEnd = createBlockEnd(BlockEndKind.End);

  return {
    kind: SyntaxKind.BlockStatement,
    statements: [],
    exit: blockEnd,
    afterExit: [],
    flags: SyntaxNodeFlags.None,
    symbolTable: createLinkedTable(globalValueTable),
    pos: 0,
    end: 0,
  };
}

export function printBlockStatement(printer: Printer, node: BlockStatement) {
  if (printer.printedBlocks.has(node)) {
    printer.println(`(--> BlockStatement ${printer.printedBlocks.get(node)})`);
    return;
  }
  printer.printedBlocks.set(node, printer.printedBlocks.size);
  printer.indent(`(BlockStatement ${printer.printedBlocks.get(node)}`);
  node.statements.forEach((stmt) => printer.printNode(stmt));
  printer.printNode(node.exit);
  if (node.afterExit.length > 0) {
    printer.indent('(Unreachable');
    node.afterExit.forEach((stmt) => printer.printNode(stmt));
    printer.dedent(')');
  }
  printer.dedent(')');
}

export function bindBlockStatement(binder: Binder, node: BlockStatement) {
  if (binder.boundBlocks.has(node)) {
    return;
  }
  binder.boundBlocks.add(node);
  // set the nearest symbol table to this blocks table.
  const currentNearest = binder.nearestSymbolTable;
  binder.nearestSymbolTable = node.symbolTable;

  node.statements.forEach((stmt) => binder.bindNode(stmt));
  binder.bindNode(node.exit);

  // restore the nearest symbol table.
  binder.nearestSymbolTable = currentNearest;
}

export function checkBlockStatement(checker: TypeChecker, node: BlockStatement) {
  if (checker.checkedBlocks.has(node)) {
    return;
  }
  checker.checkedBlocks.add(node);
  node.statements.forEach((stmt) => checker.checkNode(stmt));
  checker.checkNode(node.exit);
}

export function dataFlowBlockStatement(pass: DataFlowPass, node: BlockStatement) {
  if (pass.visitedBlocks.has(node)) {
    return;
  }
  pass.visitedBlocks.add(node);
  const symbols = node.symbolTable.entries();
  for (const [, sym] of symbols) {
    if (sym.references.length === 0) {
      let message: string;
      switch (sym.kind) {
        case SymbolKind.Function:
          message = 'Function is never called.';
          break;
        case SymbolKind.Struct:
          message = 'Struct is never used.';
          break;
        case SymbolKind.StructMember:
          message = 'Struct member is never used.';
          break;
        case SymbolKind.Parameter:
          message = 'Parameter is never used.';
          break;
        default:
          message = 'Variable is never used.';
      }
      pass.diagnostics.push(createDiagnosticWarning(
        DiagnosticSource.DataFlow,
        DiagnosticCode.NameNotUsed,
        message,
        // TODO(thomas.crane): make this pos better.
        { pos: sym.firstMention.pos, end: sym.firstMention.end },
      ));
    }
  }
  if (node.afterExit.length > 0) {
    pass.diagnostics.push(createDiagnosticWarning(
      DiagnosticSource.DataFlow,
      DiagnosticCode.UnreachableCode,
      'Unreachable code.',
      {
        pos: node.afterExit[0].pos,
        end: node.afterExit[node.afterExit.length - 1].end,
      },
    ));
  }
}
