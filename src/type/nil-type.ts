import { TypeInfo } from './type-info';
import { TypeKind } from './type-kind';

export interface NilType extends TypeInfo {
  kind: TypeKind.Nil;
}

export function createNilType(): NilType {
  return {
    kind: TypeKind.Nil,
    name: 'nil',
  };
}
