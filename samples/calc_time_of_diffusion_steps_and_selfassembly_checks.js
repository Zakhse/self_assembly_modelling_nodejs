const { performance } = require('perf_hooks')
const Lattice = require('../src/models/lattice')
const strategy = require('../src/self_assembly_checking/clusters-strategy')

const l = new Lattice({
  size: 256,
  particleLength: 6,
})
l.fillWithParticles()

let msForDiff = 0
let msForSA = 0

for (let i = 0; i < 1000; i++) {
  const prevTime1 = performance.now()
  l.makeDiffusionStep()
  msForDiff += performance.now() - prevTime1

  const prevTime2 = performance.now()
  l.checkForSelfAssembly(strategy)
  msForSA += performance.now() - prevTime2
}

console.log('ms for diff: ', msForDiff)
console.log('ms for SA: ', msForSA)
