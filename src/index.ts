#!/usr/bin/env node
// tslint:disable: no-console

import * as chalk from 'chalk';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { inspect } from 'util';
import { createSourceFile } from './ast/source-file';
import { createBinder } from './bind/binder';
import { createBlockThreader } from './optimise/block-threader';
import { createParser } from './parser';
import { createPrinter } from './printer';
import { createReporter } from './reporter';
import { createTypeChecker } from './typecheck/typechecker';

import yargs = require('yargs');
import { createDataFlowPass } from './flow/data-flow';

// tslint:disable-next-line: no-unused-expression
yargs
  .command('$0 <file>', 'Run the t compiler', (args) => {
    args
      .positional('file', { type: 'string', demandOption: true })
      .options({
        print: { type: 'boolean', default: false },
        ast: { type: 'boolean', default: false },
        thread: { type: 'boolean', default: true },
        bind: { type: 'boolean', default: true },
        check: { type: 'boolean', default: true },
        dataFlow: { type: 'boolean', default: true },
      });
  }, (argv) => {
    let input = '';
    let stream: Readable;
    const name = argv.file as string;

    if (argv.file === 'stdin') {
      stream = process.stdin;
    } else {
      stream = createReadStream(name);
    }

    stream.on('data', (chunk) => {
      input += chunk.toString();
    });
    stream.on('end', () => {
      const parser = createParser(createSourceFile([], input, name));
      const result = parser.parse();
      if (argv.thread) {
        const threader = createBlockThreader();
        threader.threadNode(result);
      }
      if (argv.bind) {
        const binder = createBinder(result.diagnostics);
        binder.bindNode(result);
      }
      if (argv.check) {
        const typeChecker = createTypeChecker(result.diagnostics);
        typeChecker.checkNode(result);
      }
      if (argv.dataFlow) {
        const dataFlowPass = createDataFlowPass(result.diagnostics);
        dataFlowPass.visitNode(result);
      }
      if (argv.ast) {
        for (const stmt of result.statements) {
          const out = inspect(stmt, false, Infinity, true);
          console.log(out);
        }
      }
      if (argv.print) {
        const printer = createPrinter();
        printer.printNode(result);
        console.log(printer.flush());
      }
      const reporter = createReporter();
      reporter.report(result);
    });
    stream.on('error', (err) => {
      console.log(`${chalk.redBright(chalk.bold('error:')) + chalk.bold(' Error while reading from')} ${chalk.cyan(name)}`);
      console.log('       ' + err.message);
      process.exit(1);
    });
  })
  .help()
  .argv;
