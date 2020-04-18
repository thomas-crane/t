import { FnSymbol, ParameterSymbol } from './function-symbol';
import { StructMemberSymbol, StructSymbol } from './struct-symbol';
import { VariableSymbol } from './variable-symbol';

/**
 * The set of all symbol types.
 */
export type SymbolType
  = VariableSymbol
  | FnSymbol
  | ParameterSymbol
  | StructSymbol
  | StructMemberSymbol
  ;
