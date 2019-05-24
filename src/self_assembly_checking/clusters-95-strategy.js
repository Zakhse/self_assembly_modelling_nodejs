const ClustersStrategy = require('./clusters-strategy')

class Clusters95Strategy extends ClustersStrategy {
  static check(lattice) {
    return super.check(lattice, 0.95)
  }
}

module.exports = Clusters95Strategy
