const { Set: HashSet } = require('hash-set-map')
const _ = require('lodash')
const { randomBoolean, getRandomFromSet } = require('../utils')
const Orientation = require('./orientation')
const Direction = require('./direction')
const Particle = require('./particle')
const Point = require('./point')

const possibleDirections = Object.values(Direction)

class Lattice {
  constructor({ size = 256, particleLength = 8 }) {
    if (size < 10 || size > 512)
      throw new RangeError(`Lattice size must be >=10 and <=512, but ${size} is provided`)

    if (!Number.isInteger(size))
      throw new TypeError(`Lattice size must be integer, but ${size} is provided`)

    if (particleLength < 2 || particleLength > 128)
      throw new RangeError(`Particle length must be >=2 and <=128, but ${particleLength} is provided`)

    if (!Number.isInteger(particleLength))
      throw new TypeError(`Particle length must be integer, but ${particleLength} is provided`)

    this.size = size
    this.particleLength = particleLength
    this._init()
  }

  _init() {
    this.particleCoords = new Map() // Key is particle, values are Point of particle's head
    this.particles = []
    this._generateLattice()
  }

  _generateLattice() {
    this.lattice = Array.from(Array(this.size), () => Array(this.size).fill(null))
  }

  _fillWithParticles() {
    const pointsForHorizontalParticles = new HashSet([], Point.hashcodeOf)
    const pointsForVerticalParticles = new HashSet([], Point.hashcodeOf)

    const size = this.size
    const particleLength = this.particleLength

    for (let i = 0; i <= size - particleLength; i++) {
      for (let j = 0; j < size; j++)
        pointsForHorizontalParticles.add(new Point(i, j))
    }

    for (let i = 0; i < size; i++) {
      for (let j = 0; j <= size - particleLength; j++)
        pointsForVerticalParticles.add(new Point(i, j))
    }

    let numberOfPlacedParticles = 0
    let chosenPoint
    let chosenOrientation
    let X
    let Y
    let particleToPlace
    while (!(pointsForHorizontalParticles.size === 0 && pointsForVerticalParticles.size === 0)) {
      if (pointsForHorizontalParticles.size === 0 || (pointsForVerticalParticles.size !== 0 && randomBoolean())) {
        chosenOrientation = Orientation.VERTICAL
        chosenPoint = getRandomFromSet(pointsForVerticalParticles)
      } else {
        chosenOrientation = Orientation.HORIZONTAL
        chosenPoint = getRandomFromSet(pointsForHorizontalParticles)
      }

      X = chosenPoint.x
      Y = chosenPoint.y
      particleToPlace = new Particle({
        orientation: chosenOrientation,
        length: particleLength,
        id: numberOfPlacedParticles + 1,
      })

      this._placeParticle(particleToPlace, chosenPoint)

      // Remove points that can't have a head of any particle now
      if (chosenOrientation === Orientation.HORIZONTAL) {
        for (let i = Math.max(0, X - particleLength + 1); i <= X + particleLength - 1; i++)
          pointsForHorizontalParticles.delete(new Point(i, Y))

        for (let i = X; i <= X + particleLength - 1; i++) {
          for (let j = Math.max(0, Y - particleLength + 1); j <= Y; j++)
            pointsForVerticalParticles.delete(new Point(i, j))
        }
      } else {
        for (let i = Math.max(0, Y - particleLength + 1); i <= Y + particleLength - 1; i++)
          pointsForVerticalParticles.delete(new Point(X, i))

        for (let j = Y; j < Y + particleLength; j++) {
          for (let i = Math.max(0, X - particleLength + 1); i <= X; i++)
            pointsForHorizontalParticles.delete(new Point(i, j))
        }
      }

      numberOfPlacedParticles++
    }
  }

  _placeParticle(particle, point) {
    const length = particle.length
    const X = point.x
    const Y = point.y
    if (particle.orientation === Orientation.HORIZONTAL) {
      for (let i = X; i < X + length; i++)
        this.lattice[i][Y] = particle
    } else {
      for (let j = Y; j < Y + length; j++)
        this.lattice[X][j] = particle
    }

    this.particleCoords.set(particle, point)
    this.particles.push(particle)
  }

  _moveParticleIfPossible(particle) {
    const directions = _.shuffle(possibleDirections)
    let index = directions.length
    let chosenDirection
    while (index > 0) {
      chosenDirection = directions[--index]
      if (this._moveParticleToDirectionIfPossible(particle, chosenDirection))
        return true
    }

    return false
  }

  _area(particle, direction) {
    const orientation = particle.orientation
    const particleHeadPoint = this.particleCoords.get(particle)

    let startX
    let endX
    let startY
    let endY

    switch (direction) {
      case Direction.UP:
      case Direction.DOWN:
        startX = particleHeadPoint.x
        startY = this._fixX(particleHeadPoint.y + (direction === Direction.UP ? -1 : 1))
        break
      case Direction.LEFT:
      case Direction.RIGHT:
        startX = this._fixX(particleHeadPoint.x + (direction === Direction.LEFT ? -1 : 1))
        startY = particleHeadPoint.y
        break
      default:
        startX = particleHeadPoint.x
        startY = particleHeadPoint.y
    }

    if (orientation === Orientation.HORIZONTAL) {
      endX = this._fixX(startX + particle.length - 1)
      endY = startY
    } else {
      endX = startX
      endY = this._fixY(startY + particle.length - 1)
    }

    return {
      startX,
      endX,
      startY,
      endY,
    }
  }

  _moveParticleToDirectionIfPossible(particle, direction) {
    const lattice = this.lattice

    const newArea = this._area(particle, direction)
    let canBeMoved = true
    let cellVal
    this._iterateArea(newArea, (x, y) => {
      cellVal = lattice[x][y]
      if (cellVal && cellVal !== particle) {
        canBeMoved = false
        return true
      }
    })

    if (!canBeMoved)
      return false

    const oldArea = this._area(particle, null)
    this._iterateArea(oldArea, (x, y) => {
      lattice[x][y] = null
    })

    this._iterateArea(newArea, (x, y) => {
      lattice[x][y] = particle
    })

    this.particleCoords.set(particle, new Point(newArea.startX, newArea.startY))

    return true
  }

  _iterateArea(area, callback) {
    const { startX, startY, endX, endY } = area
    const exclusiveX = this._fixX(endX + 1)
    const exclusiveY = this._fixY(endY + 1)

    let curX = startX
    let curY
    innerLoop : do { // eslint-disable-line no-labels
      curY = startY
      do {
        if (callback(curX, curY, this))
          break innerLoop // eslint-disable-line no-labels
        curY = this._fixY(curY + 1)
      } while (curY !== exclusiveY)
      curX = this._fixX(curX + 1)
    } while (curX !== exclusiveX)
  }

  _fixX(X) {
    return (X + this.size) % this.size
  }

  _fixY(Y) {
    // noinspection JSSuspiciousNameCombination
    return this._fixX(Y)
  }

  fillWithParticles() {
    this._fillWithParticles()
  }

  makeDiffusionStep() {
    const size = this.size
    const particles = this.particles
    let i = size
    const maxIndex = particles.length - 1
    let randomParticle

    while (i-- > 0) {
      randomParticle = particles[_.random(0, maxIndex)]
      this._moveParticleIfPossible(randomParticle)
    }
  }

  getBackup() {
    const particlesWithCoords = Array.from(this.particleCoords.entries())
      .map(([particle, point]) => ({
        id: particle.id,
        o: particle.orientation,
        x: point.x,
        y: point.y,
      }))
    return {
      s: this.size,
      l: this.particleLength,
      p: particlesWithCoords,
    }
  }

  static restoreFromBackup(backup) {
    const particleLength = backup.l
    const lattice = new Lattice({
      size: backup.s,
      particleLength: particleLength,
    })
    lattice._generateLattice()
    backup.p.forEach(({ id, o, x, y }) => {
      const point = new Point(x, y)
      const particle = new Particle({
        orientation: o,
        length: particleLength,
        id,
      })

      lattice._placeParticle(particle, point)
    })

    return lattice
  }

  getVisualization({
    [Orientation.NONE]: none = ' ',
    [Orientation.HORIZONTAL]: hor = '-',
    [Orientation.VERTICAL]: ver = '|',
  } = {}) {
    let res = ''

    const map = {
      [Orientation.NONE]: none,
      [Orientation.HORIZONTAL]: hor,
      [Orientation.VERTICAL]: ver,
    }

    const lattice = this.lattice
    const size = this.size
    for (let j = 0; j < size; j++) {
      for (let i = 0; i < size; i++) {
        const particle = lattice[i][j]
        const mappedVal = particle ? map[particle.orientation] : map[Orientation.NONE]
        res += (_.isFunction(mappedVal) ? mappedVal(particle) : mappedVal) + ' '
      }
      res += '\n'
    }

    return res
  }
}

module.exports = Lattice
