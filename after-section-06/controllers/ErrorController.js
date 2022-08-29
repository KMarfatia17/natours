const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stackTrace: err.stack,
    Error: err
  });
};

const sendErrorProd = (err, res) => {
  // when opertional errors happen and we trust the errors
  // console.log('err', err);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
    // programming errors which can leak information so generalising the error for clients
  } else {
    // console.error('ERROR :', err);
    res.status(500).json({
      status: 'error',
      message: 'something went wrong!'
    });
  }
};

const handleCastErrorDB = error => {
  const message = `invalid ${error.path} : ${error.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = error => {
  const value = error.keyValue.name;
  const message = `duplicate value: "${value}", please add another value!`;
  return new AppError(message, 400);
};

const handleValidatonErrorDB = error => {
  //const errors = Object.keys(error.errors).map(el => el.ValidatorError);
  //   console.log('error', error);
  const errorNames = Object.keys(error.errors).map(el => el);
  //   console.log('errorNames', errorNames);
  let arrMessage = Object.keys(error.errors).map((el, index) => {
    const validate = errorNames[index];
    // console.log('error.errors[validate]', error.errors[validate]);
    return error.errors[validate];
  });

  const handleJWTError = () =>
    new AppError('invalid token please login again!', 401);

  const handleJWTExpiredError = () =>
    new AppError('token expired please log in again!', 401);

  let message = arrMessage.map(el => {
    return el.toString();
  });
  // console.log('message', message);
  message = `invalid input for the following fields : ${message
    .join('. ')
    .trim()}!`;

  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message =
    err.message || `cannot find path to ${req.originalURL} on this server!`;
  err.status = err.status || 'Fail';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign({}, err);
    // console.log('new error', error);
    // console.log('error.errors.name', error.errors.name);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error._message === 'Tour validation failed')
      error = handleValidatonErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
