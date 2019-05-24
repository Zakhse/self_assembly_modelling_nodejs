#!/usr/bin/env node

const yargs = require('yargs')

const runDiffusion = require('./src/cli/run-diffusion')

const yargsConf = yargs.scriptName('self-assembly')
  .usage('Usage: $0 <cmd> [args]')
  .command('run-diffusion', 'Run diffusion modeling', function (yargs) {
    return yargs
      .usage('Usage: $0 run-diffusion [args]')
      .option('lattice-size', {
        alias: 'S',
        default: 256,
        describe: 'Height and width of the lattice',
        type: 'number',
      })
      .option('particle-length', {
        alias: 'P',
        default: 8,
        describe: 'Length of particles in the lattice',
        type: 'number',
      })
      .option('steps', {
        alias: 's',
        describe: 'Fixed number of diffusion steps (unlimited by default)',
        type: 'number',
      })
      .option('log-lattice-each', {
        describe: 'Log to output visualization of lattice after each <n> step (not logging by default)',
        type: 'number',
      })
      .option('monochrome', {
        alias: ['m', 'no-color'],
        default: false,
        describe: 'Disable coloring horizontal and vertical particles in log',
        type: 'boolean',
      })
      .option('save-to-dir', {
        alias: ['d'],
        describe: 'Path to directory for saving steps of modeling (directory name can be generated or passed explicitly)',
        coerce: saveToDir => saveToDir || true,
        type: 'string',
      })
      .option('restore-from', {
        alias: ['f'],
        describe: 'Path to file with backup of lattice state to use it instead of generating new lattice',
        type: 'string',
      })
      .option('save-each-step', {
        describe: 'Save each <n> step of modeling to directory',
        default: 1000,
        type: 'number',
      })
      .option('save-with-img', {
        alias: ['i'],
        describe: 'Save image together with step of diffusion',
        default: false,
        type: 'boolean',
      })
      .option('self-assembly-check', {
        alias: ['A'],
        describe: 'Check if particles in lattice are self-assembled or not',
        default: false,
        type: 'boolean',
      })
      .option('self-assembly-check-strategy', {
        alias: ['C'],
        describe: 'Strategy for checking self-assembly state',
        choices: ['clusters', 'clusters-90', 'clusters-95', 'clusters-99'],
        default: 'clusters',
        type: 'string',
      })
      .option('self-assembly-find', {
        alias: ['F'],
        describe: 'Find first diffusion step with self-assembly and stop modelling',
        default: false,
        type: 'boolean',
      })
  }, function (argv) {
    const {
      latticeSize,
      particleLength,
      steps,
      logLatticeEach,
      noColor,
      saveToDir = false,
      restoreFrom,
      saveEachStep,
      saveWithImg,
      selfAssemblyCheck,
      selfAssemblyCheckStrategy,
      selfAssemblyFind,
    } = argv
    runDiffusion({
      latticeSize,
      particleLength,
      logLatticeEachStep: logLatticeEach,
      maxSteps: steps,
      noColor,
      saveToDir,
      restoreFrom,
      saveEachStep,
      saveWithImage: saveWithImg,
      selfAssemblyCheck,
      selfAssemblyCheckStrategyName: selfAssemblyCheckStrategy,
      selfAssemblyFind,
    })
  })
  .alias('h', 'help')
  .version(false)
  .parserConfiguration({
    'boolean-negation': false,
  })
  .strict(true)

if (yargsConf.argv._.length === 0)
  yargsConf.showHelp()
