const ClustersStrategy = require('./clusters-strategy')

class Clusters99Strategy extends ClustersStrategy {
  static check(lattice) {
    return super.check(lattice, 0.99)
  }
}

module.exports = Clusters99Strategy
