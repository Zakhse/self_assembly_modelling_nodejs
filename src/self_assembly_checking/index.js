// const NeighbourStrategy = require('./neighbour-strategy')
const ClustersStrategy = require('./clusters-strategy')

function checkSelfAssembly(lattice, strategy = ClustersStrategy) {
  return strategy.check(lattice)
}

module.exports = checkSelfAssembly
