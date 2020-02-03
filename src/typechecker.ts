import {
  AssignmentStatement,
  BinaryExpression,
  BinaryOperator,
  BlockStatement,
  BooleanType,
  DeclarationStatement,
  DiagnosticCode,
  DiagnosticKind,
  DiagnosticSource,
  DiagnosticType,
  ExpressionStatement,
  FnCallExpression,
  FnDeclarationStatement,
  FunctionType,
  IdentifierLiteral,
  IfStatement,
  LoopStatement,
  Node,
  NumberLiteral,
  NumberType,
  ParameterSymbol,
  ParenExpression,
  ReturnStatement,
  SyntaxKind,
  TextRange,
  Type,
  TypeChecker,
  TypeKind,
  TypeMatch,
} from './types';
import { typeMatch } from './utils';

type TypeEnv = Map<string, Type>;

const numType: NumberType = {
  kind: TypeKind.Number,
  name: 'num',
};

const boolType: BooleanType = {
  kind: TypeKind.Boolean,
  name: 'bool',
};

export function createTypeChecker(): TypeChecker {
  const typeEnvs: TypeEnv[] = [
    getGlobalTypeEnvironment(),
  ];
  const diagnostics: DiagnosticType[] = [];

  function pushEnv() {
    typeEnvs.unshift(new Map());
  }
  function popEnv() {
    typeEnvs.shift();
  }

  function findType(name: string): Type | undefined {
    for (const env of typeEnvs) {
      if (env.has(name)) {
        return env.get(name)!;
      }
    }
    return undefined;
  }

  function addType(type: Type) {
    typeEnvs[0].set(type.name, type);
  }

  function createDiagnostic(
    error: string,
    code: DiagnosticCode,
    location: TextRange,
  ) {
    diagnostics.push({
      kind: DiagnosticKind.Error,
      source: DiagnosticSource.Checker,
      code,
      error,
      ...location,
    });
  }

  function check(node: Node) {
    switch (node.kind) {
      case SyntaxKind.BinaryExpression:
        return checkBinaryExpression(node);
      case SyntaxKind.FnCallExpression:
        return checkFnCallExpression(node);
      case SyntaxKind.ParenExpression:
        return checkParenExpression(node);
      case SyntaxKind.IdentifierLiteral:
        return checkIdentifierLiteral(node);
      case SyntaxKind.NumberLiteral:
        return checkNumberLiteral(node);
      case SyntaxKind.BlockStatement:
        return checkBlockStatement(node);
      case SyntaxKind.IfStatement:
        return checkIfStatement(node);
      case SyntaxKind.AssignmentStatement:
        return checkAssignmentStatement(node);
      case SyntaxKind.DeclarationStatement:
        return checkDeclarationStatement(node);
      case SyntaxKind.FnDeclarationStatement:
        return checkFnDeclarationStatement(node);
      case SyntaxKind.ReturnStatement:
        return checkReturnStatement(node);
      case SyntaxKind.LoopStatement:
        return checkLoopStatement(node);
      case SyntaxKind.ExpressionStatement:
        return checkExpressionStatement(node);
    }
  }

  function checkChildren(nodes: Node[]) {
    for (const node of nodes) {
      check(node);
    }
  }

  function checkBinaryExpression(node: BinaryExpression) {
    check(node.left);
    check(node.right);
    // check what type the operands are supposed to be
    const expectedOperandType = binaryOpExpectedOperandType(node.operator);
    // if there is no expected type (e.g. for equality), the operand types just
    // have to be equal.
    if (!expectedOperandType) {
      const match = typeMatch(node.left.type, node.right.type);
      if (match !== TypeMatch.Equal) {
        createDiagnostic(
          'The operand types are not compatible.',
          DiagnosticCode.IncompatibleOperandTypes,
          { pos: node.pos, end: node.end },
        );
        return;
      }
    } else {
      // make sure each operand is compatible with the expected type.
      const leftMatch = typeMatch(node.left.type, expectedOperandType);
      const rightMatch = typeMatch(node.right.type, expectedOperandType);
      let hasError = false;
      if (leftMatch !== TypeMatch.Equal) {
        hasError = true;
        createDiagnostic(
          `Expected a value of type ${expectedOperandType.name}`,
          DiagnosticCode.UnexpectedType,
          { pos: node.left.pos, end: node.left.end },
        );
      }
      if (rightMatch !== TypeMatch.Equal) {
        hasError = true;
        createDiagnostic(
          `Expected a value of type ${expectedOperandType.name}`,
          DiagnosticCode.UnexpectedType,
          { pos: node.right.pos, end: node.right.end },
        );
      }
      if (hasError) {
        return;
      }
    }
    const resultType = binaryOpReturnType(node.operator);
    node.type = resultType;
  }

  function checkFnCallExpression(node: FnCallExpression) {
    // if there is no function symbol we cannot know the parameter types.
    if (node.symbol === undefined) {
      return;
    }
    const fnType = node.symbol.firstMention.type;
    if (fnType === undefined) {
      return;
    }
    // make sure the symbol refers to a function.
    if (fnType.kind !== TypeKind.Function) {
      createDiagnostic(
        `Type ${fnType.name} is not callable.`,
        DiagnosticCode.TypeNotCallable,
        { pos: node.pos, end: node.end },
      );
      return;
    }
    // check each arg type.
    checkChildren(node.args);
    if (node.args.length !== fnType.parameters.length) {
      const argWord = fnType.parameters.length === 1 ? 'argument' : 'arguments';
      createDiagnostic(
        `Expected ${fnType.parameters.length} ${argWord}, got ${node.args.length}`,
        DiagnosticCode.WrongNumberOfArguments,
        { pos: node.pos, end: node.end },
      );
      return;
    }
    let hasError = false;
    for (let i = 0; i < fnType.parameters.length; i++) {
      const paramType = fnType.parameters[i].firstMention.type;
      const argType = node.args[i].type;
      if (paramType === undefined || argType === undefined) {
        hasError = true;
        continue;
      }
      if (typeMatch(argType, paramType) !== TypeMatch.Equal) {
        hasError = true;
        createDiagnostic(
          `Expected a value of type ${paramType.name}`,
          DiagnosticCode.UnexpectedType,
          { pos: node.args[i].pos, end: node.args[i].end },
        );
      }
    }
    if (hasError) {
      return;
    }
    node.type = fnType.returnType;
  }

  function checkParenExpression(node: ParenExpression) {
    check(node.expr);
    node.type = node.expr.type;
  }

  function checkIdentifierLiteral(node: IdentifierLiteral) {
    if (node.symbol === undefined) {
      return;
    }
    node.type = node.symbol.firstMention.type;
  }

  function checkNumberLiteral(node: NumberLiteral) {
    node.type = numType;
  }

  function checkBlockStatement(node: BlockStatement) {
    pushEnv();
    checkChildren(node.statements);
    popEnv();
  }

  function checkIfStatement(node: IfStatement) {
    check(node.condition);
    check(node.body);
    if (node.elseBody) {
      check(node.elseBody);
    }
    const conditionMatch = typeMatch(node.condition.type, boolType);
    if (conditionMatch !== TypeMatch.Equal) {
      createDiagnostic(
        `Expected a value of type ${boolType.name}`,
        DiagnosticCode.UnexpectedType,
        { pos: node.condition.pos, end: node.condition.end },
      );
    }
  }

  function checkAssignmentStatement(node: AssignmentStatement) {
    check(node.value);
    const varSymbol = node.symbol;
    if (varSymbol === undefined) {
      return;
    }
    const varType = varSymbol.firstMention.type;
    if (varType === undefined) {
      return;
    }
    if (typeMatch(node.value.type, varType) !== TypeMatch.Equal) {
      createDiagnostic(
        `Expected a value of type ${varType.name}`,
        DiagnosticCode.UnexpectedType,
        { pos: node.pos, end: node.end },
      );
    }
  }

  function checkDeclarationStatement(node: DeclarationStatement) {
    check(node.value);
    node.type = node.value.type;
  }

  function checkFnDeclarationStatement(node: FnDeclarationStatement) {
    // TODO(thomas.crane): Until type annotations are implemented,
    // knowing the type of function arguments is not possible. Getting
    // the function return type could be done, but for now just use
    // numbers for everything.

    // for now just give each param the number type.
    for (const param of node.params) {
      param.type = numType;
    }
    check(node.body);
    const fnType: FunctionType = {
      kind: TypeKind.Function,
      name: `fn ${node.fnName.value}`,

      parameters: node.params.map((p) => p.symbol as ParameterSymbol),
      // fow now just give the function a return type of num.
      returnType: numType,
    };
    node.type = fnType;
  }

  function checkReturnStatement(node: ReturnStatement) {
    check(node.value);
    node.type = node.value.type;
  }

  function checkLoopStatement(node: LoopStatement) {
    check(node.body);
  }

  function checkExpressionStatement(node: ExpressionStatement) {
    check(node.expr);
    node.type = node.expr.type;
  }

  return {
    check(source) {
      checkChildren(source.statements);
      source.diagnostics.push(...diagnostics);
    },
  };
}

function getGlobalTypeEnvironment(): TypeEnv {
  const typeEnv: TypeEnv = new Map();
  typeEnv.set(numType.name, numType);
  typeEnv.set(boolType.name, boolType);
  return typeEnv;
}

function binaryOpExpectedOperandType(operator: BinaryOperator): Type | undefined {
  switch (operator.kind) {
    case SyntaxKind.PlusToken:
    case SyntaxKind.MinusToken:
    case SyntaxKind.StarToken:
    case SyntaxKind.SlashToken:
    case SyntaxKind.LessThan:
    case SyntaxKind.GreaterThan:
      return numType;
    case SyntaxKind.LogicalOr:
    case SyntaxKind.LogicalAnd:
      return boolType;
  }
  return undefined;
}

function binaryOpReturnType(operator: BinaryOperator): Type {
  switch (operator.kind) {
    case SyntaxKind.PlusToken:
    case SyntaxKind.MinusToken:
    case SyntaxKind.StarToken:
    case SyntaxKind.SlashToken:
      return numType;
    case SyntaxKind.LessThan:
    case SyntaxKind.GreaterThan:
    case SyntaxKind.EqualTo:
    case SyntaxKind.NotEqualTo:
    case SyntaxKind.LogicalOr:
    case SyntaxKind.LogicalAnd:
      return boolType;
  }
}
