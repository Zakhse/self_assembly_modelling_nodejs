const ClustersStrategy = require('./clusters-strategy')

class Clusters90Strategy extends ClustersStrategy {
  static check(lattice) {
    return super.check(lattice, 0.9)
  }
}

module.exports = Clusters90Strategy
