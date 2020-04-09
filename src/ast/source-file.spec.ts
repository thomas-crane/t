import test from 'ava';
import { printExpect } from '../test/macros';
import { createIdentifierExpression } from './expr/identifier-expr';
import { createSourceFile } from './source-file';
import { createBlockStatement } from './stmt/block-stmt';
import { createFnDeclarationStatement } from './stmt/fn-declaration-stmt';
import { createTypeReference } from './types/type-reference';

test(
  'simple print',
  printExpect,
  createSourceFile(
    [
      createFnDeclarationStatement(
        createIdentifierExpression('main'),
        [],
        createTypeReference(
          createIdentifierExpression('nil'),
        ),
        createBlockStatement(),
      ),
    ],
    '',
    'test',
  ),
  `(SourceFile
  (FnDeclarationStatement
    (IdentifierExpression "main")
    (TypeReference
      (IdentifierExpression "nil")
    )
    (BlockStatement 0
    )
  )
)`,
);
