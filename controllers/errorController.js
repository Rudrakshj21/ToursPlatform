const AppError = require('./../utils/appError');
const handleCastErrorDb = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDb = (err) => {
  const message = `Duplicate field value  : ${err.keyValue.name} . Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDb = (err) => {
  let message = [];
  const allErrors = err.errors;
  // console.log(Object.keys(allErrors));
  Object.keys(allErrors).forEach((errorField) => {
    const errMsg = allErrors[errorField].message;
    message.push(errMsg);
    // console.log(errorField);
  });
  // console.log(err.errors);
  message = message.join('. ');
  // console.log(message);
  // by default the Error() converts array to strings separated by ,
  return new AppError(message, 400);
};
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);

const handleTokenExpiredError = () =>
  new AppError('Your Token has expired. Please log in again', 401);

const sendErrorDev = (err, req, res) => {
  // console.log(err.name);
  /*if we were using /api/v1/....(starts with api) it means its for api or else it is is for rendering pages  */
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};
const sendErrorProd = (err, req, res) => {
  // console.log(err);
  // API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      // operational : trusted error , send message to client
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      // Programming or other unknown error : don't  leak error details
    } else {
      // 1) log error
      console.error('ERROR ❌', err);

      // 2 send generic message
      return res.status(500).json({
        status: 'error',
        message: 'Something went wrong',
      });
    }
  } else {
    // RENDERED WEBSITE
    // console.log(err);
    if (err.isOperational) {
      // operational : trusted error , send message to client

      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message,
      });
      // Programming or other unknown error : don't  leak error details
    } else {
      // 1) log error
      console.error('ERROR ❌', err);

      // 2 send generic message
      return res.status(500).render('error', {
        title: 'Something went wrong',
        msg: 'Please try again later',
      });
    }
  }
};
// global middleware handler
module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // console.log('production error handling');
    // console.log(err);
    // make deep copy and not shallow since error.name is inside nested object of err
    let error = JSON.parse(JSON.stringify(err));
    // This is a mongoose error hence the error object has name property
    // console.log(error);
    if (error.name === 'CastError') {
      error = handleCastErrorDb(error);
      // console.log(error);
    }
    // This is mongodb driver related error for duplicate keys
    if (error.code === 11000) {
      error = handleDuplicateFieldsDb(error);
    }

    if (error.name === 'ValidationError') {
      error = handleValidationErrorDb(error);
    }

    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpiredError();
    }
    /* need to set this cause on rendered website the above error names(castError,validationError) are api based and
     they set message property on the error object internally but in rendered website we do not have any of these types 
     hence we explicitly need to set the message property on error object from err(parameter);
    */
    error.message = err.message;
    // console.log(error);
    sendErrorProd(error, req, res);
  }
};
