# t

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

### Functions

```
fn add: a, b {
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
