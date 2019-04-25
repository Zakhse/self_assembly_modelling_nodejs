const Lattice = require('../src/models/lattice')
const backupedLattice = require('./S_128_P_12_STEP_400000')

const l = Lattice.restoreFromBackup(backupedLattice)

const res = l.checkForSelfAssembly()

console.log(res)
