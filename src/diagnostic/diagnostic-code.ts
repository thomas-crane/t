/**
 * Unique codes for each diagnostic message which can be generated.
 */
export enum DiagnosticCode {
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
}
