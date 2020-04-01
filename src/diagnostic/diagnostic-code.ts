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

  IncompatibleOperandTypes,
  UnexpectedType,
  CannotInferType,
  TypeNotCallable,
  TypeNotIndexable,
  WrongNumberOfArguments,

  UnknownMember,
  UninitialisedMember,
  RecursiveStruct,

  // warnings
  ShadowedName,
}
