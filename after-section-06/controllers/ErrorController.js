const sendErrorDev = (err, res) => {
  res.statusCode(err.statusCode).json({
    status: err.status,
    message: err.message,
    stackTrace: err.stack,
    Error: err
  });
};

const sendErrorProd = (err, res) => {
  // when opertional errors happen and we trust the errors
  if (err.isOperational) {
    res.statusCode(err.statusCode).json({
      status: err.status,
      message: err.message
    });
    // programming errors which can leak information so generalising the error for clients
  } else {
    console.error('ERROR :', err);
    res.statusCode(500).json({
      status: 'error',
      message: 'something went wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message =
    err.message || `cannot find path to ${req.originalURL} on this server!`;
  err.status = err.status || 'Fail';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);
  }
};
