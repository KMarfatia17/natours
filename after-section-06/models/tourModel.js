const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'tour must have a name'],
      unique: true,
      trim: true,
      minLength: [
        10,
        'tour name must have more than or equal to 10 characters'
      ],
      maxLength: [
        40,
        'tour name must have less than or equal to 40 characters'
      ],
      validate: [validator.isAlpha, 'only characters allowed']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'tour must have maximum group size']
    },
    difficulty: {
      type: String,
      required: [true, 'tour must have a set difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'tour difficulty must be either easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'tours rating must have more than or equal to 1.0 ratings'],
      max: [5, 'tour rating must have less than or equal to 5.0 ratings']
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: {
      type: Number,
      required: [true, 'tour must hve a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this will only point to current document means will only work in insert
          return val < this.price;
        },
        message: 'the discount price ({VALUE}) must be lower than regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'tour must have summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      selected: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// virtual properties
tourSchema.virtual('durationInWeeks').get(function() {
  return this.duration / 7;
});

// document middleware will only work for save() and create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function(next) {
//   console.log('the document will be saved....');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// query middleware
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  this.find({ secretTour: { $ne: true } });
  console.log(`the query took ${Date.now() - this.start} milliseconds!`);
  next();
});

// aggregate middleware
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
