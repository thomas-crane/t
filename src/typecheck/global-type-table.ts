import { SyntaxKind } from '../ast/syntax-node';
import { binaryOpName } from '../common/op-names';
import { createScopedMap, ScopedMap } from '../common/scoped-map';
import { Type } from '../type';
import { createBooleanType } from '../type/boolean-type';
import { createFnType } from '../type/function-type';
import { createNilType } from '../type/nil-type';
import { createNumberType } from '../type/number-type';
import { createStringType } from '../type/string-type';

export function createGlobalTypeTable(): ScopedMap<string, Type> {
  // built in types
  const numType = createNumberType();
  const boolType = createBooleanType();
  const strType = createStringType();
  const nilType = createNilType();

  // create op names for convenience.
  const eqOpName = binaryOpName[SyntaxKind.EqualTo];
  const notEqOpName = binaryOpName[SyntaxKind.NotEqualTo];

  const addOpName = binaryOpName[SyntaxKind.PlusToken];
  const subOpName = binaryOpName[SyntaxKind.MinusToken];
  const mulOpName = binaryOpName[SyntaxKind.StarToken];
  const divOpName = binaryOpName[SyntaxKind.SlashToken];

  const ltOpName = binaryOpName[SyntaxKind.LessThan];
  const gtOpName = binaryOpName[SyntaxKind.GreaterThan];

  const andOpName = binaryOpName[SyntaxKind.LogicalAnd];
  const orOpName = binaryOpName[SyntaxKind.LogicalOr];

  // number type operators.
  numType.fields[eqOpName] = createFnType(eqOpName, [numType, numType], boolType);
  numType.fields[notEqOpName] = createFnType(notEqOpName, [numType, numType], boolType);
  numType.fields[addOpName] = createFnType(addOpName, [numType, numType], numType);
  numType.fields[subOpName] = createFnType(subOpName, [numType, numType], numType);
  numType.fields[mulOpName] = createFnType(mulOpName, [numType, numType], numType);
  numType.fields[divOpName] = createFnType(divOpName, [numType, numType], numType);
  numType.fields[ltOpName] = createFnType(ltOpName, [numType, numType], boolType);
  numType.fields[gtOpName] = createFnType(gtOpName, [numType, numType], boolType);

  // bool type operators.
  boolType.fields[eqOpName] = createFnType(eqOpName, [boolType, boolType], boolType);
  boolType.fields[notEqOpName] = createFnType(notEqOpName, [boolType, boolType], boolType);
  boolType.fields[andOpName] = createFnType(andOpName, [boolType, boolType], boolType);
  boolType.fields[orOpName] = createFnType(orOpName, [boolType, boolType], boolType);

  // str type operators.
  strType.fields[eqOpName] = createFnType(eqOpName, [strType, strType], boolType);
  strType.fields[notEqOpName] = createFnType(notEqOpName, [strType, strType], boolType);
  strType.fields[addOpName] = createFnType(andOpName, [strType, strType], strType);

  // nil type operators.
  nilType.fields[eqOpName] = createFnType(eqOpName, [nilType, nilType], boolType);
  nilType.fields[notEqOpName] = createFnType(notEqOpName, [nilType, nilType], boolType);

  const table = createScopedMap<string, Type>();
  table.set(numType.name, numType);
  table.set(boolType.name, boolType);
  table.set(strType.name, strType);
  table.set(nilType.name, nilType);

  return table;
}
