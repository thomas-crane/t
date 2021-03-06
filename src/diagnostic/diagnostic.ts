import { TextRange } from '../types';
import { DiagnosticCode } from './diagnostic-code';
import { DiagnosticKind } from './diagnostic-kind';
import { DiagnosticSource } from './diagnostic-source';

/**
 * The base type of all types which represent some kind of diagnostic.
 */
export interface Diagnostic extends TextRange {
  kind: DiagnosticKind;
  source: DiagnosticSource;
  code: DiagnosticCode;
}
