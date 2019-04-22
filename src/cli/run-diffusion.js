const colors = require('colors/safe')
const Lattice = require('../models/lattice')
const Orientation = require('../models/orientation')

function handle({ latticeSize: size, particleLength, maxSteps, logLatticeEachStep, noColor }) {
  console.log(`Start modeling diffusion in lattice with size ${size} and particle length ${particleLength}`)

  if (!Number.isSafeInteger(maxSteps) || maxSteps <= 0)
    maxSteps = Infinity
  console.log(`Max steps are ${maxSteps === Infinity ? 'unlimited' : maxSteps}`)

  if (!Number.isSafeInteger(logLatticeEachStep) || logLatticeEachStep < 0)
    logLatticeEachStep = 0
  if (logLatticeEachStep)
    console.log(`Log the lattice each ${logLatticeEachStep} step`)
  else
    console.log('Logging the lattice is disabled')

  console.log(`Coloring particles is ${noColor ? 'disabled' : 'enabled'}`)
  const visualizationArg = noColor
    ? undefined
    : {
      [Orientation.VERTICAL]: (p, defaultSymbol) => colors.blue(defaultSymbol),
      [Orientation.HORIZONTAL]: (p, defaultSymbol) => colors.red(defaultSymbol),
    }

  const l = new Lattice({
    size,
    particleLength,
  })
  l.fillWithParticles()

  if (logLatticeEachStep > 0) {
    console.log('Generated lattice:')
    console.log(l.getVisualization(visualizationArg))
  }

  for (let i = 1; i <= maxSteps; i++) {
    l.makeDiffusionStep()
    if (i % logLatticeEachStep === 0) {
      console.log(`Lattice after ${i} diffusion steps:`)
      console.log(l.getVisualization(visualizationArg))
    }
  }
}

module.exports = handle
