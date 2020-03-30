import { TypeKind } from './type-kind';

/**
 * The base type of all specific forms of types.
 */
export interface TypeInfo {
  kind: TypeKind;
  name: string;
}
