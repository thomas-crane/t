import {
  AssignmentStatement,
  BinaryExpression,
  Binder,
  BlockStatement,
  DeclarationStatement,
  DiagnosticCode,
  DiagnosticKind,
  DiagnosticSource,
  DiagnosticType,
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
  TextRange,
  VariableSymbol,
} from './types';

type SymbolTable = Map<string, SymbolType>;

export function createBinder(): Binder {
  const symbolTables: SymbolTable[] = [
    new Map(),
  ];
  const diagnostics: DiagnosticType[] = [];

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

  function createDiagnostic(
    error: string,
    code: DiagnosticCode,
    location: TextRange,
  ) {
    diagnostics.push({
      kind: DiagnosticKind.Error,
      source: DiagnosticSource.Binder,
      code,
      error,
      ...location,
    });
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
    const fnSymbol = findSymbol(node.fnName.value);
    if (fnSymbol !== undefined) {
      fnSymbol.references.push(node);
      node.symbol = fnSymbol;
    } else {
      createDiagnostic(
        `Cannot find name "${node.fnName.value}"`,
        DiagnosticCode.UnknownSymbol,
        {
          pos: node.fnName.pos,
          end: node.fnName.end,
        },
      );
      node.flags |= SyntaxNodeFlags.HasErrors;
    }
    bindChildren(node.args);
  }
  function bindParenExpression(node: ParenExpression) {
    bind(node.expr);
    node.symbol = node.expr.symbol;
  }
  function bindIdentifierLiteral(node: IdentifierLiteral) {
    const varSymbol = findSymbol(node.value);
    if (varSymbol !== undefined) {
      varSymbol.references.push(node);
      node.symbol = varSymbol;
    } else {
      createDiagnostic(
        `Cannot find name "${node.value}"`,
        DiagnosticCode.UnknownSymbol,
        {
          pos: node.pos,
          end: node.end,
        },
      );
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
    node.symbol = node.identifier.symbol;
  }
  function bindDeclarationStatement(node: DeclarationStatement) {
    bind(node.value);
    // make sure we're not redeclaring an existing variable.
    const existingSymbol = findSymbol(node.identifier.value);
    if (existingSymbol !== undefined) {
      createDiagnostic(
        `Duplicate identifier "${existingSymbol.name}"`,
        DiagnosticCode.DuplicateSymbol,
        {
          pos: node.identifier.pos,
          end: node.identifier.end,
        },
      );
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
      createDiagnostic(
        `Duplicate identifier "${existingSymbol.name}"`,
        DiagnosticCode.DuplicateSymbol,
        {
          pos: node.fnName.pos,
          end: node.fnName.end,
        },
      );
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
    node.symbol = node.value.symbol;
  }
  function bindLoopStatement(node: LoopStatement) {
    bind(node.body);
  }
  function bindExpressionStatement(node: ExpressionStatement) {
    bind(node.expr);
    node.symbol = node.expr.symbol;
  }

  return {
    bind(source) {
      bindChildren(source.statements);
      source.diagnostics.push(...diagnostics);
    },
  };
}
