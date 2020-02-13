import {
  ArrayExpression,
  ArrayType,
  ArrayTypeNode,
  AssignmentStatement,
  BinaryExpression,
  BinaryOperator,
  BlockStatement,
  BooleanNode,
  BooleanType,
  DeclarationStatement,
  DiagnosticCode,
  DiagnosticKind,
  DiagnosticSource,
  DiagnosticType,
  ExpressionStatement,
  FnCallExpression,
  FnDeclarationStatement,
  FnParameter,
  FunctionType,
  IdentifierNode,
  IfStatement,
  LoopStatement,
  NilExpression,
  NilType,
  Node,
  NumberNode,
  NumberType,
  OptionalType,
  OptionalTypeNode,
  ParameterSymbol,
  ParenExpression,
  ReturnStatement,
  StringNode,
  StringType,
  StructDeclStatement,
  StructExpression,
  StructMember,
  StructSymbol,
  StructType,
  SymbolKind,
  SyntaxKind,
  SyntaxToken,
  TextRange,
  Type,
  TypeChecker,
  TypeKind,
  TypeMatch,
  TypeNode,
  TypeReference,
} from './types';
import {
  checkStructRecursion,
  typeMatch,
} from './utils';

type TypeEnv = Map<string, Type>;

const numType: NumberType = {
  kind: TypeKind.Number,
  name: 'num',
};

const boolType: BooleanType = {
  kind: TypeKind.Boolean,
  name: 'bool',
};

const strType: StringType = {
  kind: TypeKind.String,
  name: 'str',
};

const nilType: NilType = {
  kind: TypeKind.Nil,
  name: 'nil',
};

function typeName(type: TypeNode): string {
  switch (type.kind) {
    case SyntaxKind.NumKeyword:
      return numType.name;
    case SyntaxKind.BoolKeyword:
      return boolType.name;
    case SyntaxKind.StrKeyword:
      return strType.name;
    case SyntaxKind.NilKeyword:
      return nilType.name;
    case SyntaxKind.TypeReference:
      return type.name.value;
    case SyntaxKind.ArrayType:
      return `${typeName(type.itemType)}[]`;
    case SyntaxKind.OptionalType:
      return `${typeName(type.valueType)}?`;
  }
}

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

  function findTypeByName(name: string): Type | undefined {
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
      case SyntaxKind.NumKeyword:
        return checkNumKeyword(node);
      case SyntaxKind.BoolKeyword:
        return checkBoolKeyword(node);
      case SyntaxKind.StrKeyword:
        return checkStrKeyword(node);
      case SyntaxKind.NilKeyword:
        return checkNilKeyword(node);
      case SyntaxKind.TypeReference:
        return checkTypeReference(node);
      case SyntaxKind.ArrayType:
        return checkArrayType(node);
      case SyntaxKind.OptionalType:
        return checkOptionalType(node);
      case SyntaxKind.BinaryExpression:
        return checkBinaryExpression(node);
      case SyntaxKind.FnCallExpression:
        return checkFnCallExpression(node);
      case SyntaxKind.ParenExpression:
        return checkParenExpression(node);
      case SyntaxKind.ArrayExpression:
        return checkArrayExpression(node);
      case SyntaxKind.StructExpression:
        return checkStructExpression(node);
      case SyntaxKind.Identifier:
        return checkIdentifierNode(node);
      case SyntaxKind.Number:
        return checkNumberNode(node);
      case SyntaxKind.Boolean:
        return checkBooleanNode(node);
      case SyntaxKind.String:
        return checkStringNode(node);
      case SyntaxKind.NilExpression:
        return checkNilExpression(node);
      case SyntaxKind.BlockStatement:
        return checkBlockStatement(node);
      case SyntaxKind.IfStatement:
        return checkIfStatement(node);
      case SyntaxKind.AssignmentStatement:
        return checkAssignmentStatement(node);
      case SyntaxKind.DeclarationStatement:
        return checkDeclarationStatement(node);
      case SyntaxKind.FnParameter:
        return checkFnParameter(node);
      case SyntaxKind.FnDeclarationStatement:
        return checkFnDeclarationStatement(node);
      case SyntaxKind.ReturnStatement:
        return checkReturnStatement(node);
      case SyntaxKind.LoopStatement:
        return checkLoopStatement(node);
      case SyntaxKind.ExpressionStatement:
        return checkExpressionStatement(node);
      case SyntaxKind.StructDeclStatement:
        return checkStructDeclStatement(node);
      case SyntaxKind.StructMember:
        return checkStructMember(node);
    }
  }

  function checkChildren(nodes: Node[]) {
    for (const node of nodes) {
      check(node);
    }
  }

  function checkNumKeyword(node: SyntaxToken<SyntaxKind.NumKeyword>) {
    node.type = numType;
  }

  function checkBoolKeyword(node: SyntaxToken<SyntaxKind.BoolKeyword>) {
    node.type = numType;
  }

  function checkStrKeyword(node: SyntaxToken<SyntaxKind.StrKeyword>) {
    node.type = strType;
  }

  function checkNilKeyword(node: SyntaxToken<SyntaxKind.NilKeyword>) {
    node.type = nilType;
  }

  function checkTypeReference(node: TypeReference) {
    const type = findTypeByName(node.name.value);
    node.type = type;
  }

  function checkArrayType(node: ArrayTypeNode) {
    check(node.itemType);
    if (node.itemType.type === undefined) {
      return;
    }
    const arrayType: ArrayType = {
      kind: TypeKind.Array,
      name: `${node.itemType.type.name}[]`,
      itemType: node.itemType.type,
    };
    node.type = arrayType;
  }

  function checkOptionalType(node: OptionalTypeNode) {
    check(node.valueType);
    if (node.valueType.type === undefined) {
      return;
    }
    const optionalType: OptionalType = {
      kind: TypeKind.Optional,
      name: `${node.valueType.type.name}?`,
      valueType: node.valueType.type,
    };
    node.type = optionalType;
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
    if (node.symbol === undefined || node.symbol.kind !== SymbolKind.Function) {
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
    for (let i = 0; i < node.args.length; i++) {
      const arg = node.args[i];
      const paramSymbol = node.symbol.parameters[i];
      // give the arg node the expected type before checking it.
      if (paramSymbol?.firstMention.type !== undefined) {
        arg.type = paramSymbol.firstMention.type;
      }
      check(arg);
    }
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

  function checkArrayExpression(node: ArrayExpression) {
    checkChildren(node.items);
    if (node.items.length === 0 && node.type === undefined) {
      // if there are no items and there is no expected type,
      // it is impossible to infer the type.
      createDiagnostic(
        'Cannot infer the type of an empty array.',
        DiagnosticCode.CannotInferType,
        { pos: node.pos, end: node.end },
      );
      return;
    }
    let expectedItemType: Type;
    // if there is already an expected type, make sure each item matches it
    if (node.type !== undefined && node.type.kind === TypeKind.Array) {
      expectedItemType = node.type.itemType;
    } else {
      // otherwise, get the first item type that we can find.
      const firstType = node.items
        .map((item) => item.type)
        .filter((type) => type !== undefined)[0];

      if (firstType === undefined) {
        // if none of the item types had a type, then bail.
        createDiagnostic(
          'Cannot infer the type of this array because none of the array item\'s types are known.',
          DiagnosticCode.CannotInferType,
          { pos: node.pos, end: node.end },
        );
        return;
      } else {
        expectedItemType = firstType;
      }
    }
    // make sure each item matches the expected type.
    for (const item of node.items) {
      const itemMatch = typeMatch(item.type, expectedItemType);
      if (itemMatch !== TypeMatch.Equal) {
        createDiagnostic(
          `Expected a value of type ${expectedItemType.name}`,
          DiagnosticCode.UnexpectedType,
          { pos: item.pos, end: item.end },
        );
      }
    }
    // add the type if there is not already an expected one.
    if (node.type === undefined) {
      const arrayType: ArrayType = {
        kind: TypeKind.Array,
        name: `${expectedItemType.name}[]`,
        itemType: expectedItemType,
      };
      node.type = arrayType;
    }
  }

  function checkStructExpression(node: StructExpression) {
    // make sure the type exists. If it doesn't it will be
    // reported by the binder so there is no need to report again.
    const structType = findTypeByName(node.name.value);
    if (structType === undefined || structType.kind !== TypeKind.Struct) {
      return;
    }
    // tslint:disable-next-line: forin
    for (const name in node.members) {
      // report any excess properties
      if (!structType.members.hasOwnProperty(name)) {
        createDiagnostic(
          `Struct "${structType.name}" has no member "${name}"`,
          DiagnosticCode.UnknownMember,
          { pos: node.members[name].pos, end: node.members[name].end },
        );
        continue;
      }
      const expectedMemberType = structType.members[name];
      if (expectedMemberType !== undefined) {
        node.members[name].type = expectedMemberType;
      }
      check(node.members[name]);
    }
    // check if any properties were not initialised.
    const structMembers = node.symbol as StructSymbol;
    for (const name in structMembers.members) {
      if (!node.members.hasOwnProperty(name)) {
        createDiagnostic(
          `No initialiser for struct member "${name}"`,
          DiagnosticCode.UninitialisedMember,
          { pos: node.pos, end: node.end },
        );
      }
    }
    node.type = structType;
  }

  function checkIdentifierNode(node: IdentifierNode) {
    if (node.symbol === undefined) {
      return;
    }
    node.type = node.symbol.firstMention.type;
  }

  function checkNumberNode(node: NumberNode) {
    node.type = numType;
  }

  function checkBooleanNode(node: BooleanNode) {
    node.type = boolType;
  }

  function checkStringNode(node: StringNode) {
    node.type = strType;
  }

  function checkNilExpression(node: NilExpression) {
    node.type = nilType;
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
    // check for type annotations.
    if (node.typeNode) {
      check(node.typeNode);
      const annotatedType = node.typeNode.type;
      if (annotatedType === undefined) {
        createDiagnostic(
          `Cannot find name ${typeName(node.typeNode)}`,
          DiagnosticCode.UnknownSymbol,
          { pos: node.typeNode.pos, end: node.typeNode.end },
        );
        check(node.value);
        node.type = node.value.type;
      } else {
        // give the value node the expected type before checking it.
        node.value.type = annotatedType;
        check(node.value);
        const valueMatch = typeMatch(node.value.type, annotatedType);
        if (valueMatch !== TypeMatch.Equal) {
          createDiagnostic(
            `Expected a value of type ${annotatedType.name}`,
            DiagnosticCode.UnexpectedType,
            { pos: node.value.pos, end: node.value.end },
          );
        }
        node.type = node.typeNode.type;
      }
    } else {
      check(node.value);
      node.type = node.value.type;
    }
  }

  function checkFnParameter(node: FnParameter) {
    if (node.typeNode === undefined) {
      createDiagnostic(
        'Function parameter types cannot be inferred',
        DiagnosticCode.CannotInferType,
        { pos: node.pos, end: node.end },
      );
    } else {
      check(node.typeNode);
      const paramType = node.typeNode.type;
      if (paramType === undefined) {
        createDiagnostic(
          `Cannot find name ${typeName(node.typeNode)}`,
          DiagnosticCode.UnknownSymbol,
          { pos: node.typeNode.pos, end: node.typeNode.end },
        );
      } else {
        node.type = paramType;
      }
    }
  }

  function checkFnDeclarationStatement(node: FnDeclarationStatement) {
    checkChildren(node.params);
    check(node.body);
    let fnReturnType: Type | undefined;
    if (node.returnTypeNode === undefined) {
      createDiagnostic(
        'Function return types cannot be inferred',
        DiagnosticCode.CannotInferType,
        { pos: node.pos, end: node.end },
      );
    } else {
      check(node.returnTypeNode);
      const returnType = node.returnTypeNode.type;
      if (returnType === undefined) {
        createDiagnostic(
          `Cannot find name ${typeName(node.returnTypeNode)}`,
          DiagnosticCode.UnknownSymbol,
          { pos: node.returnTypeNode.pos, end: node.returnTypeNode.end },
        );
      }
      fnReturnType = returnType;
    }
    const fnType: FunctionType = {
      kind: TypeKind.Function,
      name: `fn ${node.fnName.value}`,

      parameters: node.params.map((p) => p.symbol as ParameterSymbol),
      returnType: fnReturnType,
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

  function registerStructDeclStatement(node: StructDeclStatement) {
    const structType: StructType = {
      kind: TypeKind.Struct,
      name: node.name.value,
      members: {},
    };
    node.type = structType;
    addType(node.type);
  }
  function checkStructDeclStatement(node: StructDeclStatement) {
    const existingType = node.type as StructType;
    // tslint:disable-next-line: forin
    for (const name in node.members) {
      check(node.members[name]);
      existingType.members[name] = node.members[name].type;
    }
    const isRecursive = checkStructRecursion(existingType);
    if (isRecursive) {
      createDiagnostic(
        `Struct "${existingType.name}" has an infinite size because it is recursively defined`,
        DiagnosticCode.RecursiveStruct,
        { pos: node.pos, end: node.end },
      );
    }
  }

  function checkStructMember(node: StructMember) {
    if (node.typeNode === undefined) {
      createDiagnostic(
        'Cannot infer the type of a struct member.',
        DiagnosticCode.CannotInferType,
        { pos: node.pos, end: node.end },
      );
    } else {
      check(node.typeNode);
      const expectedType = node.typeNode.type;
      if (expectedType === undefined) {
        createDiagnostic(
          `Cannot find name ${typeName(node.typeNode)}`,
          DiagnosticCode.UnknownSymbol,
          { pos: node.typeNode.pos, end: node.typeNode.end },
        );
      } else {
        node.type = expectedType;
      }
    }
  }

  return {
    check(source) {
      // check struct types first.
      for (const node of source.statements) {
        if (node.kind === SyntaxKind.StructDeclStatement) {
          registerStructDeclStatement(node);
        }
      }
      // then check everything else.
      checkChildren(source.statements);
      source.diagnostics.push(...diagnostics);
    },
  };
}

function getGlobalTypeEnvironment(): TypeEnv {
  const typeEnv: TypeEnv = new Map();
  typeEnv.set(numType.name, numType);
  typeEnv.set(boolType.name, boolType);
  typeEnv.set(strType.name, strType);
  typeEnv.set(nilType.name, nilType);
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
