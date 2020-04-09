import { Node } from '../ast';
import { checkArrayExpression } from '../ast/expr/array-expr';
import { checkBooleanExpression } from '../ast/expr/boolean-expr';
import { checkFnCallExpression } from '../ast/expr/fn-call-expr';
import { checkIdentifierExpression } from '../ast/expr/identifier-expr';
import { checkNumberExpression } from '../ast/expr/number-expr';
import { checkParenExpression } from '../ast/expr/paren-expr';
import { checkStringExpression } from '../ast/expr/string-expr';
import { checkStructExpression } from '../ast/expr/struct-expr';
import { checkSourceFile } from '../ast/source-file';
import { checkAssignmentStatement } from '../ast/stmt/assignment-stmt';
import { BlockStatement, checkBlockStatement } from '../ast/stmt/block-stmt';
import { checkDeclarationStatement } from '../ast/stmt/declaration-stmt';
import { checkExpressionStatement } from '../ast/stmt/expression-stmt';
import { checkFnDeclarationStatement, FnDeclarationStatement } from '../ast/stmt/fn-declaration-stmt';
import { checkGotoStatement } from '../ast/stmt/goto-stmt';
import { checkIfStatement } from '../ast/stmt/if-stmt';
import { checkLoopStatement } from '../ast/stmt/loop-stmt';
import { checkReturnStatement } from '../ast/stmt/return-stmt';
import { checkStructDeclStatement } from '../ast/stmt/struct-decl-stmt';
import { SyntaxKind } from '../ast/syntax-node';
import { checkArrayTypeNode } from '../ast/types/array-type-node';
import { checkOptionalTypeNode } from '../ast/types/optional-type-node';
import { checkTypeReference } from '../ast/types/type-reference';
import { createScopedMap, ScopedMap } from '../common/scoped-map';
import { DiagnosticType } from '../diagnostic';
import { SymbolType } from '../symbol';
import { Type } from '../type';
import { unreachable } from '../utils';
import { createGlobalTypeTable } from './global-type-table';

/**
 * An interface for taking an existing source file and annotating it
 * with type information. The correctness of the types is checked
 * at the same time.
 */
export interface TypeChecker {
  /**
   * Block statements which have already been checked.
   * This can be used to avoid infinite loops when
   * checking blocks that exit into themselves.
   */
  readonly checkedBlocks: Set<BlockStatement>;
  /**
   * The diagnostics of this type checker.
   */
  readonly diagnostics: DiagnosticType[];
  /**
   * The table which contains all
   * available types.
   */
  readonly typeTable: ScopedMap<string, Type>;
  /**
   * The table which contains symbols that have
   * been narrowed to a more specific type.
   */
  readonly narrowedTypes: ScopedMap<SymbolType, Type>;
  /**
   * The function currently being typechecked. This
   * is used to type check return statements properly.
   */
  currentFn: FnDeclarationStatement | undefined;
  /**
   * Checks the given `node`. An `expectedType` can
   * also be given in cases where the type information
   * can flow down the node tree.
   */
  checkNode(node: Node, expectedType?: Type): void;
}

export function createTypeChecker(diagnostics: DiagnosticType[]): TypeChecker {
  return {
    checkedBlocks: new Set(),
    diagnostics,
    typeTable: createGlobalTypeTable(),
    narrowedTypes: createScopedMap(),
    currentFn: undefined,

    checkNode(node) {
      switch (node.kind) {
        // expressions
        case SyntaxKind.ArrayExpression:
          return checkArrayExpression(this, node);
        case SyntaxKind.Boolean:
          return checkBooleanExpression(this, node);
        case SyntaxKind.FnCallExpression:
          return checkFnCallExpression(this, node);
        case SyntaxKind.Identifier:
          return checkIdentifierExpression(this, node);
        case SyntaxKind.Number:
          return checkNumberExpression(this, node);
        case SyntaxKind.ParenExpression:
          return checkParenExpression(this, node);
        case SyntaxKind.String:
          return checkStringExpression(this, node);
        case SyntaxKind.StructExpression:
          return checkStructExpression(this, node);

        // statements
        case SyntaxKind.AssignmentStatement:
          return checkAssignmentStatement(this, node);
        case SyntaxKind.BlockStatement:
          return checkBlockStatement(this, node);
        case SyntaxKind.DeclarationStatement:
          return checkDeclarationStatement(this, node);
        case SyntaxKind.ExpressionStatement:
          return checkExpressionStatement(this, node);
        case SyntaxKind.FnDeclarationStatement:
          return checkFnDeclarationStatement(this, node);
        case SyntaxKind.IfStatement:
          return checkIfStatement(this, node);
        case SyntaxKind.LoopStatement:
          return checkLoopStatement(this, node);
        case SyntaxKind.ReturnStatement:
          return checkReturnStatement(this, node);
        case SyntaxKind.GotoStatement:
          return checkGotoStatement(this, node);
        case SyntaxKind.StructDeclStatement:
          return checkStructDeclStatement(this, node);
        case SyntaxKind.BlockEnd:
          return;

        // types
        case SyntaxKind.ArrayType:
          return checkArrayTypeNode(this, node);
        case SyntaxKind.OptionalType:
          return checkOptionalTypeNode(this, node);
        case SyntaxKind.TypeReference:
          return checkTypeReference(this, node);

        case SyntaxKind.SourceFile:
          return checkSourceFile(this, node);
      }
      unreachable(node);
    },
  };
}
