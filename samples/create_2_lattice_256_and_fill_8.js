const Lattice = require('../src/models/lattice')

const t = Date.now()

global.prevTime = t

for (let i = 0; i < 40; i++) {
  const l = new Lattice({ size: 256, particleLength: 8 })
  l._fillWithParticles()
}

console.log('Time elapsed: ' + (Date.now() - t) + ' milliseconds')
