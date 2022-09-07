const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    // try {

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
