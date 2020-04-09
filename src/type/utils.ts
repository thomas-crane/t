import { Type } from '.';
import { SyntaxKind } from '../ast/syntax-node';
import { BinaryOperator, TokenSyntaxKind } from '../ast/token';
import { binaryOpName } from '../common/op-names';
import { createFnType, FnType } from './function-type';

function binaryOpFn(type: Type, kind: TokenSyntaxKind): FnType {
  const op = binaryOpName[kind as BinaryOperator];
  const fn = createFnType(op, [type], type);
  return fn;
}

// equality
export function createEqFn(type: Type): FnType {
  return binaryOpFn(type, SyntaxKind.EqualTo);
}
export function createNotEqFn(type: Type): FnType {
  return binaryOpFn(type, SyntaxKind.NotEqualTo);
}

// arithmetic
export function createAddFn(type: Type): FnType {
  return binaryOpFn(type, SyntaxKind.PlusToken);
}
export function createSubtractFn(type: Type): FnType {
  return binaryOpFn(type, SyntaxKind.MinusToken);
}
export function createMultiplyFn(type: Type): FnType {
  return binaryOpFn(type, SyntaxKind.StarToken);
}
export function createDivideFn(type: Type): FnType {
  return binaryOpFn(type, SyntaxKind.SlashToken);
}
