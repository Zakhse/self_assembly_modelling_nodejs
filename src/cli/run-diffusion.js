const path = require('path')
const fs = require('fs')
const shortid = require('shortid')
const colors = require('colors/safe')
const readlineSync = require('readline-sync')
const _ = require('lodash')
const rimraf = require('rimraf')
const makeDir = require('make-dir')
const Orientation = require('../models/orientation')
const Lattice = require('../models/lattice')
const utils = require('../utils')
const CliError = require('./cli-error')

function runDiffusion({
  latticeSize: size,
  particleLength,
  maxSteps,
  logLatticeEachStep,
  noColor,
  saveToDir,
  saveEachStep,
  saveWithImage,
  selfAssemblyCheck,
  selfAssemblyCheckStrategyName = null,
}) {
  console.log(`Start modeling diffusion in lattice with size ${size} and particle length ${particleLength}`)

  if (!Number.isSafeInteger(maxSteps) || maxSteps <= 0)
    maxSteps = Infinity
  console.log(`Max steps are ${maxSteps === Infinity ? 'unlimited' : maxSteps}`)

  if (!Number.isSafeInteger(logLatticeEachStep) || logLatticeEachStep < 0)
    logLatticeEachStep = 0
  if (logLatticeEachStep)
    console.log(`Log the lattice each ${logLatticeEachStep} step ${noColor ? 'without' : 'with'} coloring the particles`)
  else
    console.log('Logging the lattice is disabled')

  let selfAssemblyCheckStrategy = null
  if (selfAssemblyCheck && selfAssemblyCheckStrategyName) {
    switch (selfAssemblyCheckStrategyName) {
      case 'clusters-90':
        selfAssemblyCheckStrategy = require('../self_assembly_checking/clusters-90-strategy')
        break
      case 'clusters':
      default:
        selfAssemblyCheckStrategy = require('../self_assembly_checking/clusters-strategy')
    }

    console.log(`Checking self-assembly state is enabled with ${selfAssemblyCheckStrategyName} strategy`)
  } else {
    console.log('Checking self-assembly state is disabled')
  }

  const visualizationArg = noColor
    ? undefined
    : {
      [Orientation.VERTICAL]: (p, defaultSymbol) => colors.blue(defaultSymbol),
      [Orientation.HORIZONTAL]: (p, defaultSymbol) => colors.red(defaultSymbol),
    }

  try {
    ({
      saveToDir,
      saveEachStep,
    } = handleSaveToDir({
      saveToDir,
      saveEachStep,
      size,
      particleLength,
    }))
  } catch (e) {
    if (e.message === 'directory_is_not_empty')
      throw new CliError('Modeling steps cannot be saved in not empty directory')
    else
      throw e
  }

  if (saveToDir)
    console.log(`Save every ${saveEachStep} step of modeling to ${saveToDir}${saveWithImage ? ' with images' : ''}`)
  else
    console.log('Saving steps of modeling is disabled')

  const l = new Lattice({
    size,
    particleLength,
  })
  l.fillWithParticles()

  if (logLatticeEachStep > 0)
    logLattice(l, 0, visualizationArg)
  if (saveEachStep > 0) {
    saveLattice({
      lattice: l,
      saveToDir,
      withImage: saveWithImage,
    })
  }

  let selfAssemblyState
  for (let i = 1; i <= maxSteps; i++) {
    l.makeDiffusionStep()

    if ((i % logLatticeEachStep === 0 || i % saveEachStep === 0) && selfAssemblyCheck)
      selfAssemblyState = l.checkForSelfAssembly(selfAssemblyCheckStrategy)

    if (i % logLatticeEachStep === 0)
      logLattice(l, i, visualizationArg, selfAssemblyState)

    if (i % saveEachStep === 0) {
      saveLattice({
        lattice: l,
        saveToDir,
        withImage: saveWithImage,
        selfAssemblyState,
        selfAssemblyCheckStrategyName,
      })
    }
  }
}

function logLattice({
  lattice,
  visualizationArg,
  selfAssemblyState,
  selfAssemblyCheckStrategyName,
}) {
  const selfAssemblyMsg = _.isBoolean(selfAssemblyState)
    ? (selfAssemblyState
      ? ' IS self-assembled'
      : ' is NOT self-assembled') + ` (${selfAssemblyCheckStrategyName})`
    : ''
  console.log(`Lattice after ${lattice.getDiffusionSteps()} diffusion steps${selfAssemblyMsg}:`)
  console.log(lattice.getVisualization(visualizationArg))
}

function saveLattice({
  lattice,
  saveToDir,
  withImage = false,
  selfAssemblyState = null,
  selfAssemblyCheckStrategyName,
}) {
  let filename = lattice.getDiffusionSteps()
  if (_.isBoolean(selfAssemblyState)) {
    if (selfAssemblyState)
      filename += '_with_self_assembly'
    else
      filename += '_without_self_assembly'

    filename += `_(${selfAssemblyCheckStrategyName})`
  }

  utils.saveLattice(lattice, saveToDir, filename)

  if (withImage)
    utils.saveLatticeImg(lattice, saveToDir, filename)
}

function handleSaveToDir({ saveToDir, size, particleLength, saveEachStep }) {
  const saveEachStepIsValid = Number.isSafeInteger(saveEachStep) && saveEachStep > 0

  if (saveEachStepIsValid && saveToDir) {
    if (saveToDir === true)
      saveToDir = `lattice_${size}_particle_${particleLength}_${shortid.generate()}`
    saveToDir = path.resolve(saveToDir)

    if (fs.existsSync(saveToDir)) {
      if (fs.readdirSync(saveToDir).length > 0) {
        let answer = ''
        while (!_.isBoolean(answer)) {
          answer = readlineSync.question(`Directory ${saveToDir} is not empty. Clear it? [y/n] `, {
            trueValue: ['yes', 'y', 'Y'],
            falseValue: ['no', 'n', 'N'],
          })
        }

        if (answer)
          rimraf.sync(`${saveToDir}/*`)
        else
          throw new Error('directory_is_not_empty')
      }
    } else {
      makeDir.sync(saveToDir)
    }
  } else {
    saveToDir = false
  }

  return {
    saveToDir,
    saveEachStep: saveToDir === false ? 0 : saveEachStep,
  }
}

function handle(args) {
  try {
    runDiffusion(args)
  } catch (e) {
    if (e instanceof CliError) {
      console.log(e.message)
      console.log('Exiting...')
    } else {
      throw e
    }
  }
}

module.exports = handle
