import test from 'ava';
import { printExpect } from '../test/macros';
import { createNameExpression } from './expr/name-expr';
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
        createNameExpression('main'),
        [],
        createTypeReference(
          createNameExpression('nil'),
        ),
        createBlockStatement(),
      ),
    ],
    '',
    'test',
  ),
  `(SourceFile
  (FnDeclarationStatement
    (NameExpression "main")
    (TypeReference
      (NameExpression "nil")
    )
    (BlockStatement 0
    )
  )
)`,
);
