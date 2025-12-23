export class InvalidFileException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidFileException'
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidFileException)
    }
  }
}
