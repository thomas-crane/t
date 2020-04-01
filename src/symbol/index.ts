import { FunctionSymbol, ParameterSymbol } from './function-symbol';
import { StructMemberSymbol, StructSymbol } from './struct-symbol';
import { TypeSymbol } from './type-symbol';
import { VariableSymbol } from './variable-symbol';

/**
 * The set of all symbol types.
 */
export type SymbolType
  = TypeSymbol
  | VariableSymbol
  | FunctionSymbol
  | ParameterSymbol
  | StructSymbol
  | StructMemberSymbol
  ;
