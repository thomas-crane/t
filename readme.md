# t

[![Build Status](https://travis-ci.com/thomas-crane/t.svg?token=stAj7zoP2UACMHFzdTXv&branch=master)](https://travis-ci.com/thomas-crane/t)

t is an extremely basic language. It's only real purpose is to allow me to explore various techniques for designing a good compiler and language toolchain.

Currently, t only supports enough features to give the semantic analysis and codegen phases of the compiler a good amount of work to do. If it had any fewer features, there would not be much point in performing any kind of analysis beyond checking the syntax.

With this in mind, please stop reading this project if you are looking for a fancy new programming language. If you are interested in how compilers work, then this may be of some interest.

## Language overview

### Variables

```
; immutable
let x = 10

; mutable
mut x = 10
```

### Type annotations

Variables can optionally be annotated with a type.

```
let x: num = 10
let y: bool = true
```

In some cases type annotations are not necessary because the type can be inferred, however
in function declarations they are always required.

### Functions

```
fn add(a: num, b: num): num {
  return a + b
}

let x = add(10, 20)
```

### Control flow

#### Branching

```
if x > 10 {
  return 10
} else {
  return x
}
```

#### Looping

```
mut i = 0
loop {
  i = i + 1
  if i > 10 {
    stop
  }
}
```

### Custom types

#### Defining structs

Custom types can be created using the `struct` keyword.

```
struct Point {
  x: num,
  y: num,
}
```

Each member of the struct must have a type annotation.

#### Instantiating structs

New instances of structs can be created by using the `new` keyword and the structs name followed by a block that initialises each of the struct's members.

```
let p = new Point {
  x: 10,
  y: 20,
}
```

### Operators

+ `+`
+ `-`
+ `*`
+ `/`

+ `<`
+ `>`
+ `==`
+ `!=`

+ `&&`
+ `||`

### Keywords

+ `let`
+ `mut`

+ `if`
+ `else`

+ `fn`
+ `return`

+ `loop`
+ `stop`
