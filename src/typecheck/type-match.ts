/**
 * Types of matches which can occur when trying to
 * convert `fromType` into `toType`.
 */
export enum TypeMatch {
  /**
   * `fromType` does not match `toType` in any way.
   */
  NoMatch,
  /**
   * `fromType` is an exact match of `toType`.
   */
  Equal,
  /**
   * `fromType` is a subtype of `toType`.
   */
  SubEqual,
  /**
   * `fromType` is a supertype of `toType`.
   */
  SuperEqual,
}
