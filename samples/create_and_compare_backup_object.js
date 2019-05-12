const Lattice = require('../src/models/lattice')

const l1 = new Lattice({
  size: 10,
  particleLength: 3,
})
l1._fillWithParticles()
const v1 = l1.getVisualization()

console.log('L-1 visualization:')
console.log(v1)

const backup = l1.getBackup()
const l2 = Lattice.restoreFromBackup(backup)

console.log('L-2 visualization:')
console.log(l2.getVisualization())

const b1 = JSON.stringify(backup)
const b2 = JSON.stringify(l2.getBackup())
console.log(`Backup of restored lattice is the same: ${b1 === b2}`)

const v2 = l2.getVisualization()
console.log(`Visualizations of restored lattice and original are the same: ${v1 === v2}`)
