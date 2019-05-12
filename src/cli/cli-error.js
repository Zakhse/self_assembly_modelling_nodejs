class CliError extends Error {
  constructor(message) {
    super(message)
    this.name = 'CliError'
  }
}

module.exports = CliError
