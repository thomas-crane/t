import { Node } from '../ast';
import { bindArrayExpression } from '../ast/expr/array-expr';
import { bindFnCallExpression } from '../ast/expr/fn-call-expr';
import { bindIdentifierExpression } from '../ast/expr/identifier-expr';
import { bindParenExpression } from '../ast/expr/paren-expr';
import { bindStructExpression } from '../ast/expr/struct-expr';
import { bindSourceFile } from '../ast/source-file';
import { bindAssignmentStatement } from '../ast/stmt/assignment-stmt';
import { bindBlockStatement } from '../ast/stmt/block-stmt';
import { bindDeclarationStatement } from '../ast/stmt/declaration-stmt';
import { bindExpressionStatement } from '../ast/stmt/expression-stmt';
import { bindFnDeclarationStatement } from '../ast/stmt/fn-declaration-stmt';
import { bindIfStatement } from '../ast/stmt/if-stmt';
import { bindLoopStatement } from '../ast/stmt/loop-stmt';
import { bindReturnStatement } from '../ast/stmt/return-stmt';
import { bindStructDeclStatement } from '../ast/stmt/struct-decl-stmt';
import { SyntaxKind } from '../ast/syntax-node';
import { bindArrayTypeNode } from '../ast/types/array-type-node';
import { bindOptionalTypeNode } from '../ast/types/optional-type-node';
import { bindTypeReference } from '../ast/types/type-reference';
import { ScopedMap } from '../common/scoped-map';
import { DiagnosticType } from '../diagnostic';
import { SymbolType } from '../symbol';
import { unreachable } from '../utils';
import { createGlobalTypeTable, createGlobalValueTable } from './global-symbol-table';

/**
 * An interface for taking an existing source file node and filling
 * out some of the semantic information such as symbols.
 */
export interface Binder {
  /**
   * The diagnostics of this binder.
   */
  readonly diagnostics: DiagnosticType[];
  /**
   * The symbol table which contains
   * symbols that refer to values.
   */
  readonly valueSymbolTable: ScopedMap<string, SymbolType>;
  /**
   * The symbol table which contains
   * symbols that refer to types.
   */
  readonly typeSymbolTable: ScopedMap<string, SymbolType>;
  /**
   * Bind the given `node` by passing this binder
   * to that node's bind function.
   */
  bindNode(node: Node): void;
}

export function createBinder(diagnostics: DiagnosticType[]): Binder {

  return {
    diagnostics,
    valueSymbolTable: createGlobalValueTable(),
    typeSymbolTable: createGlobalTypeTable(),

    bindNode(node) {
      switch (node.kind) {
        // expressions
        case SyntaxKind.ArrayExpression:
          return bindArrayExpression(this, node);
        case SyntaxKind.Boolean:
          return undefined;
        case SyntaxKind.FnCallExpression:
          return bindFnCallExpression(this, node);
        case SyntaxKind.Identifier:
          return bindIdentifierExpression(this, node);
        case SyntaxKind.Number:
          return undefined;
        case SyntaxKind.ParenExpression:
          return bindParenExpression(this, node);
        case SyntaxKind.String:
          return undefined;
        case SyntaxKind.StructExpression:
          return bindStructExpression(this, node);

        // statements
        case SyntaxKind.AssignmentStatement:
          return bindAssignmentStatement(this, node);
        case SyntaxKind.BlockStatement:
          return bindBlockStatement(this, node);
        case SyntaxKind.DeclarationStatement:
          return bindDeclarationStatement(this, node);
        case SyntaxKind.ExpressionStatement:
          return bindExpressionStatement(this, node);
        case SyntaxKind.FnDeclarationStatement:
          return bindFnDeclarationStatement(this, node);
        case SyntaxKind.IfStatement:
          return bindIfStatement(this, node);
        case SyntaxKind.LoopStatement:
          return bindLoopStatement(this, node);
        case SyntaxKind.ReturnStatement:
          return bindReturnStatement(this, node);
        case SyntaxKind.StopStatement:
          return undefined;
        case SyntaxKind.StructDeclStatement:
          return bindStructDeclStatement(this, node);

        // types
        case SyntaxKind.ArrayType:
          return bindArrayTypeNode(this, node);
        case SyntaxKind.OptionalType:
          return bindOptionalTypeNode(this, node);
        case SyntaxKind.TypeReference:
          return bindTypeReference(this, node);

        case SyntaxKind.SourceFile:
          return bindSourceFile(this, node);
      }
      unreachable(node);
    },
  };
}
