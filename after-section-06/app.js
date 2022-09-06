const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/ErrorController');

const app = express();
// set security http headers
app.use(helmet());

// 1) Global MIDDLEWARES
// development loging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limit requests from same IP
const limiter = rateLimit({
  max: 170,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from same IP, please try again after an hour'
});

app.use('/app', limiter);

// body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// data sanitization will remove $ sign and dots from the operators from query string and params
app.use(mongoSanitize());

// protection from mallicious html code with javascript attached to it
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whiteList: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// serving static files
app.use(express.static(`${__dirname}/public`));

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `cannot find path to ${req.originalURL} on this server!`
  // });
  // const err = new Error(
  //   `cannot find path to ${req.originalURL} on this server!`
  // );
  // err.status = 'Fail';
  // err.statusCode = 404;
  next(new AppError(`cannot find path to ${req.originalURL} on this server!`));
});

app.use(globalErrorHandler);

module.exports = app;
