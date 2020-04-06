/**
 * Unique codes for each diagnostic message which can be generated.
 */
export enum DiagnosticCode {
  // errors
  UnknownToken,
  UnexpectedToken,
  UnterminatedStringLiteral,

  UnknownSymbol,
  DuplicateSymbol,

  UnsupportedOperator,
  UnexpectedType,
  CannotInferType,
  TypeNotCallable,
  TypeNotIndexable,
  WrongNumberOfArguments,
  CannotAssignToConst,

  UnknownMember,
  UninitialisedMember,
  RecursiveStruct,

  // warnings
  ShadowedName,
  NameNotUsed,
  UnreachableCode,
}
