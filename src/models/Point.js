class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  static hashcodeOf(point) {
    return point.hashcode()
  }

  hashcode() {
    return `${this.x}|${this.y}`
  }
}

module.exports = Point
