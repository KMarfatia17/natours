const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      next(
        new AppError('The document is not available with the mentioned ID', 404)
      );
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
    // } catch (error) {
    //   res.status(400).json({
    //     status: 'fail',
    //     message: error
    //   });
    // }
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    // try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      next(
        new AppError('The document is not available with the mentioned ID', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
    // } catch (error) {
    //   res.status(400).json({
    //     status: 'fail',
    //     message: error
    //   });
    // }
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    // console.log(req.params);
    // const id = req.params.id * 1;

    // const tour = tours.find(el => el.id === id);

    let query = Model.findById(req.params.id);
    if (populateOptions)
      query = Model.findById(req.params.id).populate(populateOptions);

    const doc = await query;
    // const tour = await Tour.findOne({_id:req.params.id})

    if (!doc) {
      return next(
        new AppError(
          'The document  is not available with the mentioned ID',
          404
        )
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitedFields()
      .paginate();

    const doc = await features.query;
    // const doc = await features.query.explain();

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: doc.length,
      data: {
        data: doc
      }
    });
  });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // try {

//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     next(new AppError('The tour is not available with the mentioned ID', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
//   // } catch (error) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: error
//   //   });
//   // }
// });

/*  ********* get all code ******************** */

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
