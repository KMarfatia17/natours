const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `cannot find path to ${req.originalURL} on this server!`
  // });
  const err = new Error(
    `cannot find path to ${req.originalURL} on this server!`
  );
  err.status = 'Fail';
  err.statusCode = 404;
  next(err);
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message =
    err.message || `cannot find path to ${req.originalURL} on this server!`;
  err.status = err.status || 'Fail';

  res.statusCode(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
