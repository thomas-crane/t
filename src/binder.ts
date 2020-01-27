import {
  AssignmentStatement,
  BinaryExpression,
  Binder,
  BlockStatement,
  DeclarationStatement,
  ExpressionStatement,
  FnCallExpression,
  FnDeclarationStatement,
  FunctionSymbol,
  IdentifierLiteral,
  IfStatement,
  LoopStatement,
  Node,
  ParameterSymbol,
  ParenExpression,
  ReturnStatement,
  SymbolKind,
  SymbolType,
  SyntaxKind,
  SyntaxNodeFlags,
  VariableSymbol,
} from './types';

type SymbolTable = Map<string, SymbolType>;

export function createBinder(): Binder {
  const symbolTables: SymbolTable[] = [
    new Map(),
  ];

  function pushScope() {
    symbolTables.unshift(new Map());
  }
  function popScope() {
    symbolTables.shift();
  }
  function findSymbol(name: string): SymbolType | undefined {
    for (const table of symbolTables) {
      if (table.has(name)) {
        return table.get(name)!;
      }
    }
    return undefined;
  }
  function addSymbol(symbol: SymbolType) {
    symbolTables[0].set(symbol.name, symbol);
  }

  function bind(node: Node) {
    switch (node.kind) {
      case SyntaxKind.BinaryExpression:
        return bindBinaryExpression(node);
      case SyntaxKind.FnCallExpression:
        return bindFnCallExpression(node);
      case SyntaxKind.ParenExpression:
        return bindParenExpression(node);
      case SyntaxKind.IdentifierLiteral:
        return bindIdentifierLiteral(node);
      case SyntaxKind.BlockStatement:
        return bindBlockStatement(node);
      case SyntaxKind.IfStatement:
        return bindIfStatement(node);
      case SyntaxKind.AssignmentStatement:
        return bindAssignmentStatement(node);
      case SyntaxKind.DeclarationStatement:
        return bindDeclarationStatement(node);
      case SyntaxKind.FnDeclarationStatement:
        return bindFnDeclarationStatement(node);
      case SyntaxKind.ReturnStatement:
        return bindReturnStatement(node);
      case SyntaxKind.LoopStatement:
        return bindLoopStatement(node);
      case SyntaxKind.ExpressionStatement:
        return bindExpressionStatement(node);
    }
  }

  function bindChildren(nodes: Node[]) {
    for (const node of nodes) {
      bind(node);
    }
  }

  function bindBinaryExpression(node: BinaryExpression) {
    bind(node.left);
    bind(node.right);
  }
  function bindFnCallExpression(node: FnCallExpression) {
    const callSymbol = findSymbol(node.fnName.value);
    if (callSymbol !== undefined) {
      callSymbol.references.push(node);
      node.symbol = callSymbol;
    } else {
      const unknownSymbol: FunctionSymbol = {
        kind: SymbolKind.Function,
        name: node.fnName.value,
        firstMention: node,
        references: [node],
        parameters: [],
      };
      node.symbol = unknownSymbol;
      node.flags |= SyntaxNodeFlags.HasErrors;
    }
    bindChildren(node.args);
  }
  function bindParenExpression(node: ParenExpression) {
    bind(node.expr);
  }
  function bindIdentifierLiteral(node: IdentifierLiteral) {
    const varSymbol = findSymbol(node.value);
    if (varSymbol !== undefined) {
      varSymbol.references.push(node);
      node.symbol = varSymbol;
    } else {
      const unknownSymbol: VariableSymbol = {
        kind: SymbolKind.Variable,
        name: node.value,
        firstMention: node,
        references: [node],
        isConst: false,
      };
      node.symbol = unknownSymbol;
      node.flags |= SyntaxNodeFlags.HasErrors;
    }
  }
  function bindBlockStatement(node: BlockStatement) {
    pushScope();
    bindChildren(node.statements);
    popScope();
  }
  function bindIfStatement(node: IfStatement) {
    bind(node.condition);
    bind(node.body);
    if (node.elseBody) {
      bind(node.elseBody);
    }
  }
  function bindAssignmentStatement(node: AssignmentStatement) {
    bind(node.identifier);
    bind(node.value);
    // set the error flag if we're assigning to a const variable.
    if ((node.identifier.symbol as VariableSymbol)?.isConst) {
      node.flags |= SyntaxNodeFlags.HasErrors;
    }
  }
  function bindDeclarationStatement(node: DeclarationStatement) {
    bind(node.value);
    // make sure we're not redeclaring an existing variable.
    const existingSymbol = findSymbol(node.identifier.value);
    if (existingSymbol !== undefined) {
      existingSymbol.references.push(node);
      node.flags |= SyntaxNodeFlags.HasErrors;
    } else {
      const varSymbol: VariableSymbol = {
        kind: SymbolKind.Variable,
        name: node.identifier.value,
        firstMention: node,
        references: [],
        isConst: node.isConst,
      };
      node.symbol = varSymbol;
      addSymbol(varSymbol);
    }
  }
  function bindFnDeclarationStatement(node: FnDeclarationStatement) {
    // check for redeclaration again
    const existingSymbol = findSymbol(node.fnName.value);
    if (existingSymbol !== undefined) {
      existingSymbol.references.push(node);
      node.flags |= SyntaxNodeFlags.HasErrors;
    } else {
      // bind each param as a parameter symbol.
      const paramSymbols: ParameterSymbol[] = [];
      for (const param of node.params) {
        const paramSymbol: ParameterSymbol = {
          kind: SymbolKind.Parameter,
          name: param.value,
          firstMention: param,
          references: [],
        };
        param.symbol = paramSymbol;
        paramSymbols.push(paramSymbol);
      }
      const fnSymbol: FunctionSymbol = {
        kind: SymbolKind.Function,
        name: node.fnName.value,
        firstMention: node,
        references: [],
        parameters: paramSymbols,
      };
      addSymbol(fnSymbol);
      // add the parameters to the function body scope before binding it.
      pushScope();
      for (const symbol of paramSymbols) {
        addSymbol(symbol);
      }
      bindChildren(node.body.statements);
      popScope();
    }
  }
  function bindReturnStatement(node: ReturnStatement) {
    bind(node.value);
  }
  function bindLoopStatement(node: LoopStatement) {
    bind(node.body);
  }
  function bindExpressionStatement(node: ExpressionStatement) {
    bind(node.expr);
  }

  return {
    bind(source) {
      bindChildren(source.statements);
    },
  };
}
