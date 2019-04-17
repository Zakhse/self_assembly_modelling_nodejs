function randomBoolean() {
  return Math.random() >= 0.5
}

function randomInteger(min, max) {
  return Math.floor(min + (Math.random() * (max + 1 - min)))
}

function getRandomFromSet(set) {
  const size = set.size
  const randIndex = randomInteger(0, size - 1)
  return Array.from(set)[randIndex]
}

module.exports = {
  randomBoolean,
  randomInteger,
  getRandomFromSet,
}
