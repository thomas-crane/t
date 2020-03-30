import { TextRange } from '../types';
import { setTextRange } from '../utils';
import { Diagnostic } from './diagnostic';
import { DiagnosticCode } from './diagnostic-code';
import { DiagnosticKind } from './diagnostic-kind';
import { DiagnosticSource } from './diagnostic-source';

/**
 * A diagnostic message suggesting a change or action to take.
 */
export interface DiagnosticHint extends Diagnostic {
  kind: DiagnosticKind.Hint;
  hint: string;
}

export function createDiagnosticHint(
  source: DiagnosticSource,
  code: DiagnosticCode,
  hint: string,
  location?: TextRange,
): DiagnosticHint {
  return setTextRange({
    kind: DiagnosticKind.Hint,
    source,
    code,
    hint,
  }, location);
}
