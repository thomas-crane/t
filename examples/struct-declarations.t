# structs can be declared using the struct keyword
# by default, all struct members are immutable.
struct Point {
  x: num,
  y: num,
}

# struct members can be made mutable by
# using the `mut` keyword.
struct MutablePoint {
  mut x: num,
  mut y: num,
}

fn main(): nil {
  # struct instances can be created by using the `new` keyword.
  let p = new Point { x: 10, y: 20 }

  # error, cannot assign to immutable struct members.
  p.x = 10

  # this works fine because the members are mutable.
  let p_mut = new MutablePoint { x: 10, y: 20 }
  p_mut.x = 20
}
