function randomBoolean() {
  return Math.random() >= 0.5
}

function randomInteger(min, max) {
  return Math.floor(min + (Math.random() * (max + 1 - min)))
}

function getRandomFromSet(set) {
  const size = set.size
  let randIndex = randomInteger(0, size - 1)

  const it = set.values()
  while (randIndex > 0) {
    it.next()
    randIndex--
  }

  return it.next().value
}

module.exports = {
  randomBoolean,
  randomInteger,
  getRandomFromSet,
}
