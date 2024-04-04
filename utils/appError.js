class AppError extends Error {
  constructor(message, statusCode) {
    // creates instance of Error and sets the message property
    super(message);
    this.statusCode = statusCode;
    // status depends on status Code
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // predictable
    this.isOperational = true;


    // to ensure the class does not pollute the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
