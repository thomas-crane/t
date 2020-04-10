fn main(): nil {
  # if/else is supported, brackets are not requied.
  if some_condition {
    do_something()
  } else {
    do_other_thing()
  }

  # loop and stop can be used to create loops. There
  # is no syntax for for loops yet, so they must be
  # created using a local variable and a loop.
  mut i = 0
  loop {
    i = i + 1
    if i > 10 {
      stop
    }
    print('iteration ' + to_string(i))
  }
}
