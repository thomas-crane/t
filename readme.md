# t

[![Build Status](https://travis-ci.com/thomas-crane/t.svg?token=stAj7zoP2UACMHFzdTXv&branch=master)](https://travis-ci.com/thomas-crane/t)

t is an extremely basic language. It's only real purpose is to allow me to explore various techniques for designing a good compiler and language toolchain.

Currently, t only supports enough features to give the semantic analysis and codegen phases of the compiler a good amount of work to do. If it had any fewer features, there would not be much point in performing any kind of analysis beyond checking the syntax.

With this in mind, please stop reading about this project if you are looking for a fancy new programming language. If you are interested in how compilers work, then this may be of some interest.

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

### Optional types

A type can be marked as optional by including a question mark after the name of the type. Optional types can be assigned the value `nil`.

```
mut maybe_num: num? = nil
```

In order to use optional types, they must be narrowed to their base type by using an if statement to make sure there is a value.

```
mut x = 0
mut y: num? = nil

if y != nil {
  ; y has a type of `num` here.
  x = x + y
} else {
  ; y has a type of `nil` here.
}
```

### Arrays

Arrays can be declared using square brackets

```
let my_array = [1, 2, 3]
```

Items of the array can be accessed by also using square brackets.

```
let first_element = my_array[0]
```

Because the index used to access the array may be outside the length of the array, the result of indexing an array is always an optional version of the item type of the array. For example,

```
let first_element = my_array[0] ; first_element is `num?` here.

if first_element != nil {
  ; first_element is `num` here.
}
```

Optionals cannot be nested, so if the item type of the array is optional, it will be the return type of an indexing expression. This also means that code such as

```
let x: num?? = nil
```

is not valid.

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

If a member of the struct needs to be mutable, it can be prefixed with the `mut` keyword.

```
struct Point {
  mut x: num,
  mut y: num,
}
```

#### Instantiating structs

New instances of structs can be created by using the `new` keyword and the structs name followed by a block that initialises each of the struct's members.

```
let p = new Point {
  x: 10,
  y: 20,
}
```

Struct members can be accessed by using dot notation

```
let total = p.x + p.y
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
