import { TypeInfo } from './type-info';
import { TypeKind } from './type-kind';

/**
 * The string type.
 */
export interface StringType extends TypeInfo {
  kind: TypeKind.String;
}

export function createStringType(): StringType {
  return {
    kind: TypeKind.String,
    name: 'str',
  };
}
