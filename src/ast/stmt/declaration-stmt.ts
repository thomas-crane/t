import { Binder } from '../../bind/binder';
import { DiagnosticCode } from '../../diagnostic/diagnostic-code';
import { createDiagnosticError } from '../../diagnostic/diagnostic-error';
import { DiagnosticSource } from '../../diagnostic/diagnostic-source';
import { createDiagnosticWarning } from '../../diagnostic/diagnostic-warning';
import { Printer } from '../../printer';
import { createVariableSymbol } from '../../symbol/variable-symbol';
import { TypeMatch } from '../../typecheck/type-match';
import { TypeChecker } from '../../typecheck/typechecker';
import { TextRange } from '../../types';
import { setTextRange, typeMatch } from '../../utils';
import { ExpressionNode } from '../expr';
import { IdentifierExpression } from '../expr/identifier-expr';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';
import { TypeNode } from '../types';

/**
 * A variable declaration statement. This encompasses
 * both mutable and immutable assignments.
 */
export interface DeclarationStatement extends SyntaxNode {
  kind: SyntaxKind.DeclarationStatement;

  isConst: boolean;
  identifier: IdentifierExpression;
  typeNode?: TypeNode;
  value: ExpressionNode;
}

export function createDeclarationStatement(
  isConst: boolean,
  identifier: IdentifierExpression,
  typeNode: TypeNode | undefined,
  value: ExpressionNode,
  location?: TextRange,
): DeclarationStatement {
  return setTextRange({
    kind: SyntaxKind.DeclarationStatement,
    isConst,
    identifier,
    typeNode,
    value,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printDeclarationStatement(printer: Printer, node: DeclarationStatement) {
  printer.indent('(DeclarationStatement');
  if (node.isConst) {
    printer.println('LetKeyword');
  } else {
    printer.println('MutKeyword');
  }
  printer.printNode(node.identifier);
  if (node.typeNode) {
    printer.printNode(node.typeNode);
  }
  printer.printNode(node.value);
  printer.dedent(')');
}

export function bindDeclarationStatement(binder: Binder, node: DeclarationStatement) {
  // bind the value first. If we bind the name first, we could end
  // up with code such as `let x = x + 1` being considered valid.
  binder.bindNode(node.value);
  if (node.typeNode) {
    binder.bindNode(node.typeNode);
  }
  // since we allow shadowing, just look in the immediate scope for duplicates.
  const existingSymbol = binder.nearestSymbolTable.getImmediate(node.identifier.value);
  if (existingSymbol !== undefined) {
    binder.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Binder,
      DiagnosticCode.DuplicateSymbol,
      `Duplicate name "${existingSymbol.name}"`,
      { pos: node.identifier.pos, end: node.identifier.end },
    ));
    node.flags |= SyntaxNodeFlags.HasErrors;
  } else {
    // warn about shadowed names.
    const shadowedSymbol = binder.nearestSymbolTable.get(node.identifier.value);
    if (shadowedSymbol !== undefined) {
      binder.diagnostics.push(createDiagnosticWarning(
        DiagnosticSource.Binder,
        DiagnosticCode.ShadowedName,
        `Shadowed name "${shadowedSymbol.name}"`,
        { pos: node.identifier.pos, end: node.identifier.end },
      ));
    }

    // add the new symbol.
    const varSymbol = createVariableSymbol(node.identifier.value, node.isConst, node);
    node.identifier.symbol = varSymbol;
    binder.nearestSymbolTable.set(varSymbol.name, varSymbol);
  }
}

export function checkDeclarationStatement(checker: TypeChecker, node: DeclarationStatement) {
  if (node.typeNode !== undefined) {
    checker.checkNode(node.typeNode);
    if (node.typeNode.type === undefined) {
      return;
    }
    node.type = node.typeNode.type;

    // make sure the value type matches the annotated type.
    checker.checkNode(node.value, node.typeNode.type);
    const match = typeMatch(node.value.type, node.typeNode.type);
    if (match !== TypeMatch.Equal) {
      checker.diagnostics.push(createDiagnosticError(
        DiagnosticSource.Checker,
        DiagnosticCode.UnexpectedType,
        `Expected a value of type ${node.typeNode.type.name}`,
        { pos: node.value.pos, end: node.value.end },
      ));
    }
  } else {
    // if there is no annotated type, the
    // decl type is inferred from the value.
    checker.checkNode(node.value);
    node.type = node.value.type;
  }
}
