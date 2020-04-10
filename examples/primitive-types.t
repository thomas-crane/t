fn main(a: num, b:num): nil {
  # The primitive types in t are num, str and bool.
  # num supports all of the ususal operators.
  let sum: num = 1 + 2 * 3 / (2 - 1)

  # str only addition (concatenation).
  let str_err = 'hello' - 'world'
  # error: The type str does not support the "-" operator.
  #  --> in examples/primitive-types.t
  #   |
  # 7 |   let str_err = 'hello' - 'world'
  #   |                 ^^^^^^^^^

  # bool can be used for boolean types.
  let some_condition: bool = true

  # comparisons work between numbers.
  let small_sum = sum < 100
}
