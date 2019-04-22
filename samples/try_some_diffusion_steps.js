const colors = require('colors/safe')
const Lattice = require('../src/models/lattice')
const Orientation = require('../src/models/orientation')

const l = new Lattice({
  size: 120,
  particleLength: 8,
})
l.fillWithParticles()

const visualizationArg = {
  [Orientation.HORIZONTAL]: () => colors.red('-'),
  [Orientation.VERTICAL]: () => colors.blue('|'),
}

console.log('Visualization of created lattice:')
console.log(l.getVisualization(visualizationArg))

for (let i = 0; i < 3000000; i++) {
  l.makeDiffusionStep()
  if ((i + 1) % 50000 === 0) {
    console.log(`Visualization after ${i + 1} diffusion steps:`)
    console.log(l.getVisualization(visualizationArg))
  }
}
