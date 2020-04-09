import { ExpressionNode } from '.';
import { Binder } from '../../bind/binder';
import { DiagnosticCode } from '../../diagnostic/diagnostic-code';
import { createDiagnosticError } from '../../diagnostic/diagnostic-error';
import { DiagnosticSource } from '../../diagnostic/diagnostic-source';
import { Printer } from '../../printer';
import { indexFnName } from '../../type/array-type';
import { FnType } from '../../type/function-type';
import { TypeKind } from '../../type/type-kind';
import { TypeMatch } from '../../typecheck/type-match';
import { TypeChecker } from '../../typecheck/typechecker';
import { TextRange } from '../../types';
import { setTextRange, typeMatch } from '../../utils';
import { SyntaxKind, SyntaxNode, SyntaxNodeFlags } from '../syntax-node';
import { IdentifierExpression } from './identifier-expr';

export const enum FnCallFlags {
  None = 0,

  FieldAccess = 1 << 1,

  Operator = 1 << 2,
  BinaryOp = 1 << 3,
  UnaryOp = 1 << 4,

  Index = 1 << 5,
}

/**
 * A function call expression.
 */
export interface FnCallExpression extends SyntaxNode {
  kind: SyntaxKind.FnCallExpression;

  fn: ExpressionNode;
  args: ExpressionNode[];
  fnFlags: FnCallFlags;
}

export function createFnCallExpression(
  fn: ExpressionNode,
  args: ExpressionNode[],
  fnFlags: FnCallFlags = FnCallFlags.None,
  location?: TextRange,
): FnCallExpression {
  return setTextRange({
    kind: SyntaxKind.FnCallExpression,
    fn,
    args,
    flags: SyntaxNodeFlags.None,
    fnFlags,
  }, location);
}

export function printFnCallExpression(printer: Printer, node: FnCallExpression) {
  if (node.fnFlags & FnCallFlags.FieldAccess) {
    printFieldAccess(printer, node);
    return;
  }
  if (node.fnFlags & FnCallFlags.BinaryOp) {
    printBinaryOp(printer, node);
    return;
  }
  if (node.fnFlags & FnCallFlags.UnaryOp) {
    printUnaryOp(printer, node);
    return;
  }
  if (node.fnFlags & FnCallFlags.Index) {
    printIndex(printer, node);
    return;
  }
  printer.indent('(FnCallExpression');
  printer.printNode(node.fn);
  node.args.forEach((arg) => printer.printNode(arg));
  printer.dedent(')');
}

function printFieldAccess(printer: Printer, node: FnCallExpression) {
  printer.indent('(FieldAccess');
  printer.printNode(node.fn);
  printer.printNode(node.args[0]);
  printer.dedent(')');
}

function printBinaryOp(printer: Printer, node: FnCallExpression) {
  printer.indent('(BinaryExpression');
  printer.printNode(node.args[0]);
  printer.printNode(node.fn);
  printer.printNode(node.args[1]);
  printer.dedent(')');
}

function printUnaryOp(printer: Printer, node: FnCallExpression) {
  printer.indent('(UnaryExpression');
  printer.printNode(node.fn);
  printer.printNode(node.args[0]);
  printer.dedent(')');
}

function printIndex(printer: Printer, node: FnCallExpression) {
  printer.indent('(IndexExpression');
  printer.printNode(node.fn);
  printer.printNode(node.args[0]);
  printer.dedent(')');
}

export function bindFnCallExpression(binder: Binder, node: FnCallExpression) {
  // if this fn call is an operator, we can only bind the arguments. The
  // fn name will refer to the operator, and whether or not the operator
  // is supported is type information.
  if (!(node.fnFlags & FnCallFlags.Operator)) {
    binder.bindNode(node.fn);
  }
  if (node.fnFlags & FnCallFlags.FieldAccess) {
    // since we don't know the type of the target yet, we can't determine whether
    // or the member being accessed is actually part of that type. The name
    // may refer to something on the type, so wait until later to check args.
    return;
  }
  node.args.forEach((arg) => binder.bindNode(arg));
}

export function checkFnCallExpression(checker: TypeChecker, node: FnCallExpression) {
  if (node.fnFlags & FnCallFlags.FieldAccess) {
    return checkFieldAccess(checker, node);
  }
  if (node.fnFlags & FnCallFlags.BinaryOp) {
    return checkBinaryOp(checker, node);
  }
  if (node.fnFlags & FnCallFlags.UnaryOp) {
    return checkUnaryOp(checker, node);
  }
  if (node.fnFlags & FnCallFlags.Index) {
    return checkIndex(checker, node);
  }

  // make sure the name refers to a callable type.
  checker.checkNode(node.fn);
  if (node.fn.type === undefined) {
    return;
  }
  if (node.fn.type.kind !== TypeKind.Fn) {
    checker.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Binder,
      DiagnosticCode.UnknownSymbol,
      `Type ${node.fn.type.name} is not callable.`,
      { pos: node.fn.pos, end: node.fn.end },
    ));
    return;
  }
  node.type = node.fn.type.returnType;

  // check each arg type.
  for (let i = 0; i < node.args.length; i++) {
    const arg = node.args[i];
    const param = node.fn.type.parameters[i];

    // the fn call has too many args.
    if (param === undefined) {
      const argWord = node.fn.type.parameters.length === 1 ? 'argument' : 'arguments';
      checker.diagnostics.push(createDiagnosticError(
        DiagnosticSource.Binder,
        DiagnosticCode.WrongNumberOfArguments,
        `Expected ${node.fn.type.parameters.length} ${argWord}, got ${node.args.length}`,
        // start at the current arg, go until the last arg.
        { pos: arg.pos, end: node.args[node.args.length - 1].end },
      ));
      return;
    }

    // match the arg type to the param type.
    checker.checkNode(arg, param);
    const argMatch = typeMatch(arg.type, param);
    if (argMatch !== TypeMatch.Equal) {
      checker.diagnostics.push(createDiagnosticError(
        DiagnosticSource.Binder,
        DiagnosticCode.UnexpectedType,
        `Expected a value of type ${param.name}`,
        { pos: arg.pos, end: arg.end },
      ));
    }
  }
  // the fn call does not have enough args.
  if (node.args.length !== node.fn.type.parameters.length) {
    const argWord = node.fn.type.parameters.length === 1 ? 'argument' : 'arguments';
    checker.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Binder,
      DiagnosticCode.WrongNumberOfArguments,
      `Expected ${node.fn.type.parameters.length} ${argWord}, got ${node.args.length}`,
      // start at the current arg, go until the last arg.
      { pos: node.fn.pos, end: node.fn.end },
    ));
    return;
  }
}

function checkFieldAccess(checker: TypeChecker, node: FnCallExpression) {
  // type check the receiver first.
  checker.checkNode(node.fn);
  if (node.fn.type === undefined) {
    return;
  }

  // we now need to do name resolution on the field.
  const name = node.args[0] as IdentifierExpression;
  if (node.fn.type.fields[name.value] === undefined) {
    checker.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Binder,
      DiagnosticCode.UnknownSymbol,
      `Cannot find name "${name.value}"`,
      { pos: name.pos, end: name.end },
    ));
    return;
  }

  // get the type of the field.
  node.type = node.fn.type.fields[name.value];
}

function checkBinaryOp(checker: TypeChecker, node: FnCallExpression) {
  const left = node.args[0];
  const right = node.args[1];
  const operator = node.fn as IdentifierExpression;

  // type check both args.
  checker.checkNode(left);
  checker.checkNode(right);
  if (left.type === undefined) {
    return;
  }

  // check if the operator is supported by this type.
  if (left.type.fields[operator.value] === undefined) {
    checker.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Checker,
      DiagnosticCode.UnsupportedOperator,
      `The type ${left.type.name} does not support the "${operator.value}" operator.`,
      { pos: left.pos, end: operator.end },
    ));
    return;
  }

  // the right hand side must match the arg type of the operator fn.
  if (right.type === undefined) {
    return;
  }
  const operatorFn = left.type.fields[operator.value] as FnType;
  const match = typeMatch(right.type, operatorFn.parameters[1]);
  if (match !== TypeMatch.Equal) {
    checker.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Checker,
      DiagnosticCode.UnexpectedType,
      `Expected a value of type ${operatorFn.parameters[1].name}`,
      { pos: right.pos, end: right.end },
    ));
    return;
  }
  node.type = operatorFn.returnType;
}

function checkUnaryOp(checker: TypeChecker, node: FnCallExpression) {
  const operand = node.args[0];
  const operator = node.fn as IdentifierExpression;

  // type check the arg
  checker.checkNode(operand);
  if (operand.type === undefined) {
    return;
  }

  // check if the operator is supported by this type.
  if (operand.type.fields[operator.value] === undefined) {
    checker.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Checker,
      DiagnosticCode.UnsupportedOperator,
      `The type ${operand.type.name} does not support the "${operator.value}" operator.`,
      { pos: operator.pos, end: operand.end },
    ));
    return;
  }

  const operatorFn = operand.type.fields[operator.value] as FnType;
  node.type = operatorFn.returnType;
}

function checkIndex(checker: TypeChecker, node: FnCallExpression) {
  const index = node.args[0];

  // type check the receiver first.
  checker.checkNode(node.fn);
  if (node.fn.type === undefined) {
    return;
  }

  // make sure the type can be indexed.
  if (node.fn.type.fields[indexFnName] === undefined) {
    checker.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Checker,
      DiagnosticCode.TypeNotIndexable,
      `Cannot index the type ${node.fn.type.name}`,
      { pos: node.fn.pos, end: node.fn.end },
    ));
    return;
  }

  // type check the index.
  checker.checkNode(index);
  if (index.type === undefined) {
    return;
  }

  // make sure the index type match the expected one.
  const indexFn = node.fn.type.fields[indexFnName] as FnType;
  const match = typeMatch(index.type, indexFn.parameters[0]);
  if (match !== TypeMatch.Equal) {
    checker.diagnostics.push(createDiagnosticError(
      DiagnosticSource.Checker,
      DiagnosticCode.UnexpectedType,
      `Expected a value of type ${indexFn.parameters[0]}`,
      { pos: index.pos, end: index.end },
    ));
    return;
  }

  node.type = indexFn.returnType;
}
