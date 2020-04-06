import { ExpressionNode } from '.';
import { Binder } from '../../bind/binder';
import { DiagnosticCode } from '../../diagnostic/diagnostic-code';
import { createDiagnosticError } from '../../diagnostic/diagnostic-error';
import { DiagnosticSource } from '../../diagnostic/diagnostic-source';
import { Printer } from '../../printer';
import { Type } from '../../type';
import { createArrayType } from '../../type/array-type';
import { TypeMatch } from '../../typecheck/type-match';
import { TypeChecker } from '../../typecheck/typechecker';
import { TextRange } from '../../types';
import { setTextRange, typeMatch } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';

/**
 * A list of expressions surrounded by square brackets.
 */
export interface ArrayExpression extends SyntaxNode {
  kind: SyntaxKind.ArrayExpression;

  items: ExpressionNode[];
}

export function createArrayExpression(
  items: ExpressionNode[],
  location?: TextRange,
): ArrayExpression {
  return setTextRange({
    kind: SyntaxKind.ArrayExpression,
    items,
    flags: SyntaxNodeFlags.None,
  }, location);
}

export function printArrayExpression(printer: Printer, node: ArrayExpression) {
  printer.indent('(ArrayExpression');
  node.items.forEach((item) => printer.printNode(item));
  printer.dedent(')');
}

export function bindArrayExpression(binder: Binder, node: ArrayExpression) {
  node.items.forEach((item) => binder.bindNode(item));
}

export function checkArrayExpression(checker: TypeChecker, node: ArrayExpression, expectedType?: Type) {
  node.items.forEach((item) => checker.checkNode(item, expectedType));
  // if there are no items and no expected type,
  // we cannot infer anything.
  if (node.items.length === 0 && expectedType === undefined) {
    checker.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Checker,
      DiagnosticCode.CannotInferType,
      'Cannot infer the type of an empty array.',
      { pos: node.pos, end: node.end },
    ));
    return;
  }

  let expectedItemType: Type;
  if (expectedType !== undefined) {
    expectedItemType = expectedType;
  } else {
    // if there's no expected type, just take the first type.
    const firstType = node.items
      .map((item) => item.type)
      .filter((type) => type !== undefined)
      .shift();
    if (firstType === undefined) {
      // if none of the item types are known,
      // we cannot infer anything. A diagnostic
      // will most likely have been reported if none of
      // the items could be successfully typechecked, so don't
      // report another one here.
      return;
    } else {
      expectedItemType = firstType;
    }
    // make sure each item matches the expected type.
    for (const item of node.items) {
      const itemMatch = typeMatch(item.type, expectedItemType);
      if (itemMatch !== TypeMatch.Equal) {
        checker.diagnostics.push(createDiagnosticError(
          DiagnosticSource.Checker,
          DiagnosticCode.UnexpectedType,
          `Expected a value of type ${expectedItemType.name}`,
          { pos: item.pos, end: item.end },
        ));
      }
    }
    const numType = checker.typeTable.get('num');
    if (numType === undefined) {
      return;
    }
    node.type = createArrayType(expectedItemType, numType);
  }
}
