import { createToken } from './factory';
import {
  ArrayType,
  BinaryOperator,
  FunctionType,
  OptionalType,
  StructType,
  SyntaxKind,
  TextRange,
  Type,
  TypeKind,
  TypeMatch,
} from './types';

/**
 * Sets the text range on the given target.
 */
export function setTextRange<T>(target: Exclude<T, keyof TextRange>, range?: TextRange): T & TextRange {
  return {
    ...target,
    pos: range?.pos ?? 0,
    end: range?.end ?? 0,
  };
}

/**
 * Tries to cast `fromType` into `toType` and determines
 * how well the two types match.
 */
export function typeMatch(fromType: Type | undefined, toType: Type | undefined): TypeMatch {
  if (fromType === undefined || toType === undefined) {
    return TypeMatch.NoMatch;
  }
  if (fromType === toType) {
    return TypeMatch.Equal;
  }
  // check for nil -> optional or optional -> nil
  if (fromType.kind === TypeKind.Nil && toType.kind === TypeKind.Optional
    || fromType.kind === TypeKind.Optional && toType.kind === TypeKind.Nil) {
    return TypeMatch.Equal;
  }

  // check for T -> T?
  if (toType.kind === TypeKind.Optional) {
    const optionalMatch = typeMatch(fromType, toType.valueType);
    if (optionalMatch === TypeMatch.Equal) {
      return TypeMatch.Equal;
    }
  }
  // T? -> T is not valid so don't bother.

  if (fromType.kind !== toType.kind) {
    return TypeMatch.NoMatch;
  }

  // since we already checked that fromType.kind === toType.kind
  // we can safely assume that they are of the same type for casting purposes.
  switch (fromType.kind) {
    // these primitives are always equal.
    case TypeKind.Number:
    case TypeKind.Boolean:
    case TypeKind.String:
    case TypeKind.Nil:
      return TypeMatch.Equal;
    case TypeKind.Function:
      return typeMatchFunction(fromType, toType as FunctionType);
    case TypeKind.Array:
      return typeMatchArray(fromType, toType as ArrayType);
    case TypeKind.Struct:
      return typeMatchStruct(fromType, toType as StructType);
    case TypeKind.Optional:
      return typeMatchOptional(fromType, toType as OptionalType);
  }
}

function typeMatchFunction(fromType: FunctionType, toType: FunctionType): TypeMatch {
  if (fromType.parameters.length !== toType.parameters.length) {
    return TypeMatch.NoMatch;
  }
  // TODO(thomas.crane): implement covariance/contravariance
  // as necessary. For now just check for exact matches.

  const returnTypeMatch = typeMatch(fromType.returnType, toType.returnType);
  if (returnTypeMatch !== TypeMatch.Equal) {
    return TypeMatch.NoMatch;
  }

  const paramMatches = fromType.parameters.map((fromParam, i) => {
    const fromParamType = fromParam.firstMention.type;
    const toParamType = toType.parameters[i].firstMention.type;
    return typeMatch(fromParamType, toParamType);
  });
  if (paramMatches.some((match) => match !== TypeMatch.Equal)) {
    return TypeMatch.NoMatch;
  }
  return TypeMatch.Equal;
}

function typeMatchArray(fromType: ArrayType, toType: ArrayType): TypeMatch {
  return typeMatch(fromType.itemType, toType.itemType);
}

function typeMatchStruct(fromType: StructType, toType: StructType): TypeMatch {
  // TODO(thomas.crane): work out sub/super types. For
  // now just check for exact matches.
  // tslint:disable-next-line: forin
  for (const name in fromType.members) {
    if (!toType.members.hasOwnProperty(name)) {
      return TypeMatch.NoMatch;
    }
    const fromMember = fromType.members[name];
    // make sure the member types match.
    if (typeMatch(fromMember, toType.members[name]) !== TypeMatch.Equal) {
      return TypeMatch.NoMatch;
    }
  }

  return TypeMatch.Equal;
}

function typeMatchOptional(fromType: OptionalType, toType: OptionalType): TypeMatch {
  return typeMatch(fromType.valueType, toType.valueType);
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

export function operatorCanNarrow(operator: BinaryOperator): boolean {
  switch (operator.kind) {
    case SyntaxKind.EqualTo:
    case SyntaxKind.NotEqualTo:
      return true;
    default:
      return false;
  }
}

export function invertNarrowingOperator(operator: BinaryOperator): BinaryOperator {
  switch (operator.kind) {
    case SyntaxKind.EqualTo:
      return createToken(SyntaxKind.NotEqualTo);
    case SyntaxKind.NotEqualTo:
      return createToken(SyntaxKind.EqualTo);
    default:
      throw new Error(`invertNarrowingOperator should not have been called with operator ${SyntaxKind[operator.kind]}`);
  }
}
