import { TextRange } from '../types';
import { setTextRange } from '../utils';
import { Diagnostic } from './diagnostic';
import { DiagnosticCode } from './diagnostic-code';
import { DiagnosticKind } from './diagnostic-kind';
import { DiagnosticSource } from './diagnostic-source';

/**
 * A diagnostic message about something that is not a problem
 * now but could become one in the future.
 */
export interface DiagnosticWarning extends Diagnostic {
  kind: DiagnosticKind.Warning;
  warning: string;
}

export function createDiagnosticWarning(
  source: DiagnosticSource,
  code: DiagnosticCode,
  warning: string,
  location: TextRange,
): DiagnosticWarning {
  return setTextRange({
    kind: DiagnosticKind.Warning,
    source,
    code,
    warning,
  }, location);
}
