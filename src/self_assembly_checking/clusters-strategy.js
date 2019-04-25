const Orientation = require('../models/orientation')

class ClustersStrategy {
  static check(lattice, coef = 0.5) {
    const sizes = this._getClusterSizes(lattice)

    let maxHorizontal = 0
    let sumHorizontal = 0
    let maxVertical = 0
    let sumVertical = 0

    for (const size of Object.values(sizes[Orientation.VERTICAL])) {
      sumVertical += size
      if (size > maxVertical)
        maxVertical = size
    }
    for (const size of Object.values(sizes[Orientation.HORIZONTAL])) {
      sumHorizontal += size
      if (size > maxHorizontal)
        maxHorizontal = size
    }

    return maxHorizontal / sumHorizontal >= coef && maxVertical / sumVertical >= coef
  }

  static _getClustersMatrix(lattice) {
    const lastY = lattice.size - 1
    const lastX = lattice.size - 1
    const size = lattice.size
    const clustersIndices = []
    const clustersLattice = Array(size).fill(null).map(() => Array(size).fill(null))
    const latticeWithParticles = lattice.lattice

    this._processCell(0, 0, null, null, null, null, latticeWithParticles, clustersLattice, clustersIndices)
    for (let y = 0, x = 1; x < size; x++)
      this._processCell(x, y, x - 1, y, null, null, latticeWithParticles, clustersLattice, clustersIndices)
    for (let x = 0, y = 1; y < size; y++)
      this._processCell(x, y, null, null, x, y - 1, latticeWithParticles, clustersLattice, clustersIndices)

    // All except top and left cells
    for (let y = 1; y < size; y++) {
      for (let x = 1; x < size; x++)
        this._processCell(x, y, x - 1, y, x, y - 1, latticeWithParticles, clustersLattice, clustersIndices)
    }

    // Left column and top row finish checking
    this._processFinish(0, 0, lastX, 0, 0, lastY, latticeWithParticles, clustersLattice, clustersIndices)
    for (let x = 1; x <= lastX; x++)
      this._processFinish(x, 0, x - 1, 0, x, lastY, latticeWithParticles, clustersLattice, clustersIndices)
    for (let y = 1; y <= lastY; y++)
      this._processFinish(0, y, lastX, y, 0, y - 1, latticeWithParticles, clustersLattice, clustersIndices)

    // Turn all cluster indices in lattice to right indices
    let currClusterIndex
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        currClusterIndex = clustersLattice[y][x]
        if (currClusterIndex !== undefined)
          clustersLattice[y][x] = this._getRightIndexForCluster(clustersIndices, currClusterIndex)
      }
    }

    return clustersLattice
  }

  static _getRightIndexForCluster(clustersArray, clusterIndex) {
    const currentIndexPointTo = clustersArray[clusterIndex]

    if (clusterIndex === currentIndexPointTo)
      return clusterIndex

    const res = this._getRightIndexForCluster(clustersArray, currentIndexPointTo)
    if (clustersArray[clusterIndex] !== res)
      clustersArray[clusterIndex] = res

    return res
  }

  static _processCell(currX, currY, leftX, leftY, topX, topY, squareLattice, clustersLattice, custersArray) {
    if (!squareLattice[currY][currX])
      return

    const withoutLeft = leftX === null && leftY === null
    const withoutTop = topX === null && topY === null

    // States of mask:
    // 0 - left and top cells don't fit
    // 1 - left fits, top doesn't
    // 2 - top fits, left doesn't
    // 3 - left and top cells fit
    let mask = 0
    const currentCell = squareLattice[currY][currX]
    if (!withoutLeft) {
      const leftVal = squareLattice[leftY][leftX]
      if (leftVal && leftVal.orientation === currentCell.orientation)
        mask += 1
    }

    if (!withoutTop) {
      const rightCell = squareLattice[topY][topX]
      if (rightCell && rightCell.orientation === currentCell.orientation)
        mask += 2
    }

    if (mask === 0) {
      const nextClusterIndex = custersArray.length
      clustersLattice[currY][currX] = nextClusterIndex
      custersArray.push(nextClusterIndex)
    } else if (mask === 1) {
      clustersLattice[currY][currX] = clustersLattice[leftY][leftX]
    } else if (mask === 2) {
      clustersLattice[currY][currX] = clustersLattice[topY][topX]
    } else if (mask === 3) {
      const rightTopCluster = this._getRightIndexForCluster(custersArray, clustersLattice[topY][topX])
      const rightLeftCluster = this._getRightIndexForCluster(custersArray, clustersLattice[leftY][leftX])
      if (rightTopCluster < rightLeftCluster) {
        clustersLattice[currY][currX] = rightTopCluster
        custersArray[rightLeftCluster] = rightTopCluster
      } else {
        clustersLattice[currY][currX] = rightLeftCluster
        custersArray[rightTopCluster] = rightLeftCluster
      }
    } else {
      throw new Error(`Strange state of mask: ${mask}`)
    }
  }

  static _processFinish(currX, currY, leftX, leftY, topX, topY, squareLattice, clustersLattice, clustersArray) {
    if (!squareLattice[currY][currX])
      return

    const prevCluster = this._getRightIndexForCluster(clustersArray, clustersLattice[currY][currX])

    this._processCell(currX, currY, leftX, leftY, topX, topY, squareLattice, clustersLattice, clustersArray)
    const newCluster = this._getRightIndexForCluster(clustersArray, clustersLattice[currY][currX])
    if (newCluster !== prevCluster) {
      if (newCluster > prevCluster)
        clustersArray[newCluster] = prevCluster
      else
        clustersArray[prevCluster] = newCluster
    }
  }

  static _getClusterSizes(lattice) {
    const clustersLattice = this._getClustersMatrix(lattice)
    const res = {
      [Orientation.VERTICAL]: {},
      [Orientation.HORIZONTAL]: {},
    }
    const height = lattice.size
    const width = lattice.size
    let currCell
    let currCluster
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        currCell = lattice.lattice[y][x]
        if (!currCell)
          continue

        currCluster = clustersLattice[y][x]

        res[currCell.orientation][currCluster] = (res[currCell.orientation][currCluster] || 0) + 1
      }
    }
    return res
  }
}

module.exports = ClustersStrategy
