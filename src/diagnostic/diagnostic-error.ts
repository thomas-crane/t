import { TextRange } from '../types';
import { setTextRange } from '../utils';
import { Diagnostic } from './diagnostic';
import { DiagnosticCode } from './diagnostic-code';
import { DiagnosticKind } from './diagnostic-kind';
import { DiagnosticSource } from './diagnostic-source';

/**
 * A diagnostic message about something which has gone wrong
 * and from which the system cannot continue.
 */
export interface DiagnosticError extends Diagnostic {
  kind: DiagnosticKind.Error;
  error: string;
}

export function createDiagnosticError(
  source: DiagnosticSource,
  code: DiagnosticCode,
  error: string,
  location?: TextRange,
): DiagnosticError {
  return setTextRange({
    kind: DiagnosticKind.Error,
    source,
    code,
    error,
  }, location);
}
