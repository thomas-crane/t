import { Node } from './ast';
import { printArrayExpression } from './ast/expr/array-expr';
import { printBinaryExpression } from './ast/expr/binary-expr';
import { printBooleanExpression } from './ast/expr/boolean-expr';
import { printFnCallExpression } from './ast/expr/fn-call-expr';
import { printIdentifierExpression } from './ast/expr/identifier-expr';
import { printIndexExpression } from './ast/expr/index-expr';
import { printMemberAccessExpression } from './ast/expr/member-access-expr';
import { printNumberExpression } from './ast/expr/number-expr';
import { printParenExpression } from './ast/expr/paren-expr';
import { printStringExpression } from './ast/expr/string-expr';
import { printStructExpression } from './ast/expr/struct-expr';
import { printSourceFile } from './ast/source-file';
import { printAssignmentStatement } from './ast/stmt/assignment-stmt';
import { printBlockStatement } from './ast/stmt/block-stmt';
import { printDeclarationStatement } from './ast/stmt/declaration-stmt';
import { printExpressionStatement } from './ast/stmt/expression-stmt';
import { printFnDeclarationStatement } from './ast/stmt/fn-declaration-stmt';
import { printIfStatement } from './ast/stmt/if-stmt';
import { printLoopStatement } from './ast/stmt/loop-stmt';
import { printReturnStatement } from './ast/stmt/return-stmt';
import { printStopStatement } from './ast/stmt/stop-stmt';
import { printStructDeclStatement } from './ast/stmt/struct-decl-stmt';
import { SyntaxKind } from './ast/syntax-node';
import { printArrayTypeNode } from './ast/types/array-type-node';
import { printOptionalTypeNode } from './ast/types/optional-type-node';
import { printTypeReference } from './ast/types/type-reference';
import { unreachable } from './utils';

export interface Printer {
  /**
   * Prints the `str` if it is given, then
   * increases the current indentation of the printer.
   */
  indent(str?: string): void;
  /**
   * Prints the given `str` and appends a newline.
   */
  println(str: string): void;
  /**
   * Decreases the current indentation of the printer,
   * then prints the `str` if it is given.
   */
  dedent(str?: string): void;
  /**
   * Prints the given node by passing this printer
   * to that node's print function.
   */
  printNode(node: Node): void;
  /**
   * Returns the buffered output of this printer
   * and clears the buffer.
   */
  flush(): string;
}

export function createPrinter(): Printer {
  let buffer = '';
  let currentIndent = 0;
  const INDENT_SIZE = 2;
  return {
    indent(str) {
      if (str !== undefined) {
        this.println(str);
      }
      currentIndent++;
    },
    println(str) {
      buffer += ' '.repeat(currentIndent * INDENT_SIZE);
      buffer += str + '\n';
    },
    dedent(str) {
      if (currentIndent > 0) {
        currentIndent--;
      }
      if (str !== undefined) {
        this.println(str);
      }
    },
    flush() {
      const copy = buffer.slice();
      buffer = '';
      return copy;
    },
    printNode(node) {
      switch (node.kind) {
        // expressions
        case SyntaxKind.ArrayExpression:
          return printArrayExpression(this, node);
        case SyntaxKind.BinaryExpression:
          return printBinaryExpression(this, node);
        case SyntaxKind.Boolean:
          return printBooleanExpression(this, node);
        case SyntaxKind.FnCallExpression:
          return printFnCallExpression(this, node);
        case SyntaxKind.Identifier:
          return printIdentifierExpression(this, node);
        case SyntaxKind.IndexExpression:
          return printIndexExpression(this, node);
        case SyntaxKind.MemberAccessExpression:
          return printMemberAccessExpression(this, node);
        case SyntaxKind.Number:
          return printNumberExpression(this, node);
        case SyntaxKind.ParenExpression:
          return printParenExpression(this, node);
        case SyntaxKind.String:
          return printStringExpression(this, node);
        case SyntaxKind.StructExpression:
          return printStructExpression(this, node);

        // statements
        case SyntaxKind.AssignmentStatement:
          return printAssignmentStatement(this, node);
        case SyntaxKind.BlockStatement:
          return printBlockStatement(this, node);
        case SyntaxKind.DeclarationStatement:
          return printDeclarationStatement(this, node);
        case SyntaxKind.ExpressionStatement:
          return printExpressionStatement(this, node);
        case SyntaxKind.FnDeclarationStatement:
          return printFnDeclarationStatement(this, node);
        case SyntaxKind.IfStatement:
          return printIfStatement(this, node);
        case SyntaxKind.LoopStatement:
          return printLoopStatement(this, node);
        case SyntaxKind.ReturnStatement:
          return printReturnStatement(this, node);
        case SyntaxKind.StopStatement:
          return printStopStatement(this, node);
        case SyntaxKind.StructDeclStatement:
          return printStructDeclStatement(this, node);

        // types
        case SyntaxKind.ArrayType:
          return printArrayTypeNode(this, node);
        case SyntaxKind.OptionalType:
          return printOptionalTypeNode(this, node);
        case SyntaxKind.TypeReference:
          return printTypeReference(this, node);

        case SyntaxKind.SourceFile:
          return printSourceFile(this, node);
      }

      unreachable(node);
    },
  };
}
