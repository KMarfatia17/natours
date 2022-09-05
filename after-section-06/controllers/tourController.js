// const fs = require('fs');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };
exports.aliasTopFiveCheap = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const reqQueryObj = { ...this.queryString };
    const excludedQuery = ['limit', 'page', 'fields', 'sort'];
    excludedQuery.forEach(el => delete reqQueryObj[el]);

    let queryStr = JSON.stringify(reqQueryObj);
    queryStr = queryStr.replace(
      /\b(gte|lte|gt|lt)\b/g,
      matchedWord => `$${matchedWord}`
    );

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortQuery = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortQuery);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitedFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

exports.getAllTours = catchAsync(async (req, res, next) => {
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
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitedFields()
    .paginate();
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours
    }
  });
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: error
  //   });
  // }
});

exports.getTour = catchAsync(async (req, res, next) => {
  // console.log(req.params);
  // const id = req.params.id * 1;

  // const tour = tours.find(el => el.id === id);
  try {
    console.log(req.params.id);
    const tour = await Tour.findById(req.params.id);
    // const tour = await Tour.findOne({_id:req.params.id})
    console.log(tour);
    if (!tour) {
      return next(
        new AppError('The tour is not available with the mentioned ID', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (error) {
    console.log('Error Getting', error);
    // res.status(404).json({
    //   status: 'fail',
    //   message: error
    // });
  }
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
  // console.log(req.body);

  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);

  // tours.push(newTour);

  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   err => {
  //     res.status(201).json({
  //       status: 'success',
  //       data: {
  //         tour: newTour
  //       }
  //     });
  //   }
  // );

  // try {
  //   const newTour = await Tour.create(req.body);
  //   res.status(201).json({
  //     status: 'success',
  //     data: {
  //       tour: newTour
  //     }
  //   });
  // } catch (error) {
  //   // console.log("error",there was an error )
  //   res.status(400).json({
  //     status: 'fail',
  //     message: error
  //   });
  // }
});

exports.updateTour = catchAsync(async (req, res, next) => {
  // try {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!tour) {
    next(new AppError('The tour is not available with the mentioned ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: error
  //   });
  // }
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  // try {

  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    next(new AppError('The tour is not available with the mentioned ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: {
      tour
    }
  });
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: error
  //   });
  // }
});

exports.TourStats = catchAsync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgPrice: { $avg: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: '$EASY' } }
    // }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: error
  //   });
  // }
});

exports.tourMonthlyPlans = catchAsync(async (req, res, next) => {
  // try {
  const year = req.params.year * 1;
  const plans = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plans
    }
  });
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: error
  //   });
  // }
});
