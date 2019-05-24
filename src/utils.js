const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const PNG = require('pngjs').PNG
const Orientation = require('./models/orientation')

function randomBoolean() {
  return Math.random() >= 0.5
}

function randomInteger(min, max) {
  return Math.floor(min + (Math.random() * (max + 1 - min)))
}

function saveLattice(lattice, directoryPath, filename) {
  if (_.isFunction(filename))
    filename = filename(lattice)

  filename = '' + filename // cast to string

  if (path.extname(filename) !== '.json')
    filename += '.json'

  fs.writeFileSync(path.resolve(directoryPath, filename), JSON.stringify(lattice.getBackup()))
}

function saveLatticeImg(lattice, directoryPath, filename) {
  if (_.isFunction(filename))
    filename = filename(lattice)

  filename = '' + filename // cast to string

  if (path.extname(filename) !== '.png')
    filename += '.png'

  const newFile = new PNG({
    width: lattice.size,
    height: lattice.size,
  })

  for (let y = 0; y < newFile.height; y++) {
    for (let x = 0; x < newFile.width; x++) {
      const idx = ((newFile.width * y) + x) << 2

      const orientation = lattice.lattice[x][y] ? lattice.lattice[x][y].orientation : Orientation.NONE

      let red, green, blue
      switch (orientation) {
        case Orientation.NONE:
          red = 255
          green = 255
          blue = 255
          break
        case Orientation.HORIZONTAL:
          red = 255
          green = 0
          blue = 0
          break
        case Orientation.VERTICAL:
          red = 0
          green = 0
          blue = 255
          break
      }

      newFile.data[idx] = red
      newFile.data[idx + 1] = green
      newFile.data[idx + 2] = blue
      newFile.data[idx + 3] = 255
    }
  }

  fs.writeFileSync(path.resolve(directoryPath, filename), PNG.sync.write(newFile))
}

module.exports = {
  randomBoolean,
  randomInteger,
  saveLattice,
  saveLatticeImg,
}
