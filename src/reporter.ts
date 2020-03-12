import * as chalk from 'chalk';
import { DiagnosticKind, DiagnosticType, Reporter, ReporterOptions, SourceFile, TextRange } from './types';

const DEFAULT_OPTIONS: ReporterOptions = {
  color: true,
  output: process.stdout,
};

export function createReporter(options: ReporterOptions = DEFAULT_OPTIONS): Reporter {
  function getLine(src: string, pos: number, end: number): string {
    const lastLine = src.lastIndexOf('\n', pos) + 1; // cut off the \n
    const nextLine = src.indexOf('\n', end);
    return src.slice(lastLine, nextLine);
  }

  function getLinePos(src: string, pos: number, end: number): TextRange {
    const lastLine = src.lastIndexOf('\n', pos) + 1; // cut off the \n
    return {
      pos: pos - lastLine,
      end: end - lastLine,
    };
  }

  function getLineNumber(src: string, pos: number) {
    let lineCount = 1;
    let currentIdx = 0;
    while (true) {
      const next = src.indexOf('\n', currentIdx + 1);
      if (next === -1) {
        return lineCount + 1;
      }
      if (pos >= currentIdx && pos <= next) {
        return lineCount;
      }
      lineCount++;
      currentIdx = next;
    }
  }

  type ColorFn = (str: string) => string;
  function maybeColor(...fns: ColorFn[]) {
    return (str: string): string => {
      if (options.color) {
        return fns.reduce((s, fn) => fn(s), str);
      } else {
        return str;
      }
    };
  }
  const colors = {
    err: maybeColor(chalk.redBright, chalk.bold),
    warn: maybeColor(chalk.yellowBright, chalk.bold),
    msg: maybeColor(chalk.cyanBright, chalk.bold),
    hint: maybeColor(chalk.greenBright, chalk.bold),
    white: maybeColor(chalk.whiteBright, chalk.bold),
    cyan: maybeColor(chalk.cyan),
    blue: maybeColor(chalk.blueBright, chalk.bold),
  };

  function diagnosticType(diagnostic: DiagnosticType) {
    switch (diagnostic.kind) {
      case DiagnosticKind.Hint:
        return colors.hint('hint');
      case DiagnosticKind.Error:
        return colors.err('error');
      case DiagnosticKind.Message:
        return colors.msg('message');
      case DiagnosticKind.Warning:
        return colors.warn('warning');
    }
  }

  function diagnosticMessage(diagnostic: DiagnosticType) {
    switch (diagnostic.kind) {
      case DiagnosticKind.Hint:
        return diagnostic.hint;
      case DiagnosticKind.Error:
        return diagnostic.error;
      case DiagnosticKind.Message:
        return diagnostic.message;
      case DiagnosticKind.Warning:
        return diagnostic.warning;
    }
  }

  function writeHeader(diagnostic: DiagnosticType) {
    options.output.write(`${diagnosticType(diagnostic)}: ${colors.white(diagnosticMessage(diagnostic))}\n`);
  }

  function writeLineInfo(source: SourceFile, diagnostic: DiagnosticType) {
    const lineNumber = getLineNumber(source.text, diagnostic.pos).toString();
    const lnSpacing = ' '.repeat(lineNumber.length);
    const line = getLine(source.text, diagnostic.pos, diagnostic.end);
    const relativePos = getLinePos(source.text, diagnostic.pos, diagnostic.end);
    const errLen = relativePos.end - relativePos.pos;
    let errorMarker = colors.err('^'.repeat(errLen));
    // if the underline is 2 characters or less, add `-- here` to make it stand out more.
    if (errLen <= 2) {
      errorMarker += colors.err('-- here');
    }

    options.output.write(`${lnSpacing}${colors.blue('-->')} in ${colors.cyan(source.fileName)}\n`);
    options.output.write(`${lnSpacing} ${colors.blue('|')}\n`);
    options.output.write(`${colors.blue(`${lineNumber} |`)} ${line}\n`);
    options.output.write(`${lnSpacing} ${colors.blue('|')}`);
    options.output.write(`${' '.repeat(relativePos.pos + 1)}${errorMarker}\n\n`);
  }

  return {
    report(source) {
      for (const diagnostic of source.diagnostics) {
        writeHeader(diagnostic);
        writeLineInfo(source, diagnostic);
      }
    },
  };
}
