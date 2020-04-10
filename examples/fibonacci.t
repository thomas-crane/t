fn main(): nil {
  # first 10 fibonacci numbers.
  let result = fib(10)
}

# function return types can be inferred, but
# because this function is recursive it requires
# a return type annotation.
fn fib(n: num): num {
  if n < 2 {
    return n
  }
  return fib(n - 1) + fib(n - 2)
}
