const Review = require('../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  // try {
  // const reqQueryObj = { ...req.query };
  // const excludedQuery = ['limit', 'page', 'fields', 'sort'];
  // excludedQuery.forEach(el => delete reqQueryObj[el]);

  // let queryStr = JSON.stringify(reqQueryObj);
  // queryStr = queryStr.replace(
  //   /\b(gte|lte|gt|lt)\b/g,
  //   matchedWord => `$${matchedWord}`
  // );
  // queryStr = JSON.parse(queryStr);

  // let query = Tour.find(queryStr);
  // sorting

  // limited fields
  // if (req?.query?.fields) {
  //   const fields = req.query.fields.split(',').join(' ');
  //   query = query.select(fields);
  // } else {
  //   query = query.select('-__v');
  // }

  // pagination

  // awaiting query response

  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: reviews.length,
    data: {
      reviews
    }
  });
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: error
  //   });
  // }
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review)
    return next(new AppError('review not found by the provided id', 404));

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

exports.setTourAndUserIds = (req, res, next) => {
  if (req.body.tour) req.body.tour = req.params.tourId;
  if (req.body.user) req.body.user = req.user.id;
};

exports.createReview = catchAsync(async (req, res, next) => {
  // allow nested routes
  if (req.body.tour) req.body.tour = req.params.tourId;
  if (req.body.user) req.body.user = req.user.id;

  const review = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review
    }
  });
});

exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
