import { ExecutionContext } from 'ava';
import { Node } from '../ast';
import { SyntaxKind } from '../ast/syntax-node';
import { createPrinter } from '../printer';

/**
 * Prints the `node` and expects that the
 * result is the `expected` string.
 */
export function printExpect(t: ExecutionContext, node: Node, expected: string) {
  const printer = createPrinter();
  printer.printNode(node);
  // the printer always adds a newline, so add one to the
  // expected string if there isn't already one.
  if (!expected.endsWith('\n')) {
    expected += '\n';
  }
  t.is(printer.flush(), expected);
}
printExpect.title = (title = '', input: Node) => `printer > ${SyntaxKind[input.kind]} ${title}`;
