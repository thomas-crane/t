import { TypeInfo } from './type-info';
import { TypeKind } from './type-kind';

/**
 * The boolean type.
 */
export interface BooleanType extends TypeInfo {
  kind: TypeKind.Boolean;
}

export function createBooleanType(): BooleanType {
  return {
    kind: TypeKind.Boolean,
    name: 'bool',
    fields: {},
  };
}
