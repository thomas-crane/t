import {
  createAssignmentStatement,
  createBinaryExpression,
  createBlockStatement,
  createFnCallExpression,
  createFnDeclarationStatement,
  createIfStatement,
  createLoopStatement,
  createReturnStatement,
  createSourceFile,
  createExpressionStatement,
} from './factory';
import {
  BlockStatement,
  ExpressionNode,
  IdentifierLiteral,
  Node,
  StatementNode,
  SyntaxKind,
  SyntaxNodeFlags,
} from './types';
export type Visitor = (node: Node) => Node;

/**
 * Traverses the provided `node` in a depth-first, post-order fashion. The
 * supplied `visitor` will be called for each node that is visited.
 */
export function traverse(node: Node, visitor: Visitor): Node {
  switch (node.kind) {
    case SyntaxKind.SourceFile:
      {
        const statements: StatementNode[] = [];
        let hasChanged = false;
        for (const stmt of node.statements) {
          const result = traverse(stmt, visitor);
          if (result !== stmt) {
            hasChanged = true;
          }
          statements.push(result as StatementNode);
        }
        if (hasChanged) {
          node = createSourceFile(statements, node.text, node.fileName);
        }
        return visitor(node);
      }
    case SyntaxKind.BlockStatement:
      {
        const statements: StatementNode[] = [];
        let hasChanged = false;
        for (const stmt of node.statements) {
          const result = traverse(stmt, visitor);
          if (result !== stmt) {
            hasChanged = true;
          }
          statements.push(result as StatementNode);
        }
        if (hasChanged) {
          node = createBlockStatement(statements);
          node.flags |= SyntaxNodeFlags.Synthetic;
        }
        return visitor(node);
      }
    case SyntaxKind.IfStatement:
      {
        const condition = visitor(node.condition) as ExpressionNode;
        const body = traverse(node.body, visitor) as BlockStatement;
        let elseBody: BlockStatement | undefined;
        if (node.elseBody) {
          elseBody = traverse(node.elseBody, visitor) as BlockStatement;
        }
        if (condition !== node.condition || body !== node.body || elseBody !== node.elseBody) {
          node = createIfStatement(condition, body, elseBody);
          node.flags |= SyntaxNodeFlags.Synthetic;
        }
        return visitor(node);
      }
    case SyntaxKind.AssignmentStatement:
      {

        const identifier = traverse(node.identifier, visitor) as IdentifierLiteral;
        const value = traverse(node.value, visitor) as ExpressionNode;
        if (identifier !== node.identifier || value !== node.value) {
          node = createAssignmentStatement(identifier, value);
          node.flags |= SyntaxNodeFlags.Synthetic;
        }
        return visitor(node);
      }
    case SyntaxKind.DeclarationStatement:
      {
        const identifier = traverse(node.identifier, visitor) as IdentifierLiteral;
        const value = traverse(node.value, visitor) as ExpressionNode;
        if (identifier !== node.identifier || value !== node.value) {
          node = createAssignmentStatement(identifier, value);
          node.flags |= SyntaxNodeFlags.Synthetic;
        }
        return visitor(node);
      }
    case SyntaxKind.FnDeclarationStatement:
      {
        const fnName = traverse(node.fnName, visitor) as IdentifierLiteral;
        let hasChanged = false;
        const params: IdentifierLiteral[] = [];
        for (const param of node.params) {
          const result = traverse(param, visitor) as IdentifierLiteral;
          if (result !== param) {
            hasChanged = true;
          }
          params.push(result);
        }
        const body = traverse(node.body, visitor) as BlockStatement;
        if (fnName !== node.fnName || hasChanged || body !== node.body) {
          node = createFnDeclarationStatement(fnName, params, body);
          node.flags |= SyntaxNodeFlags.Synthetic;
        }
        return visitor(node);
      }
    case SyntaxKind.ReturnStatement:
      {
        const value = traverse(node.value, visitor) as ExpressionNode;
        if (value !== node.value) {
          node = createReturnStatement(value);
          node.flags |= SyntaxNodeFlags.Synthetic;
        }
        return visitor(node);
      }
    case SyntaxKind.LoopStatement:
      {
        const body = traverse(node.body, visitor) as BlockStatement;
        if (body !== node.body) {
          node = createLoopStatement(body);
          node.flags |= SyntaxNodeFlags.Synthetic;
        }
        return visitor(node);
      }
    case SyntaxKind.ExpressionStatement:
      {
        const expr = traverse(node.expr, visitor) as ExpressionNode;
        if (expr !== node.expr) {
          node = createExpressionStatement(expr);
          node.flags |= SyntaxNodeFlags.Synthetic;
        }
        return visitor(node);
      }
    case SyntaxKind.BinaryExpression:
      {
        const left = traverse(node.left, visitor) as ExpressionNode;
        const right = traverse(node.right, visitor) as ExpressionNode;
        if (left !== node.left || right !== node.right) {
          node = createBinaryExpression(left, node.operator, right);
          node.flags |= SyntaxNodeFlags.Synthetic;
        }
        return visitor(node);
      }
    case SyntaxKind.FnCallExpression:
      {
        const fnName = traverse(node.fnName, visitor) as IdentifierLiteral;
        let hasChanged = false;
        const args: ExpressionNode[] = [];
        for (const arg of node.args) {
          const result = traverse(arg, visitor) as ExpressionNode;
          if (result !== arg) {
            hasChanged = true;
          }
          args.push(arg);
        }
        if (fnName !== node.fnName || hasChanged) {
          node = createFnCallExpression(fnName, args);
          node.flags |= SyntaxNodeFlags.Synthetic;
        }
        return visitor(node);
      }
    case SyntaxKind.NumberLiteral:
    case SyntaxKind.IdentifierLiteral:
      {
        return visitor(node);
      }
  }
}
