const mongoose = require('mongoose');
const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide rating to the review'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must have an author'],
    },
  },
  //   virtual properties show up in json and object outputs
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

// prevent duplicate reviews by creating compound index of tour and user ids
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // console.log('in review pre hook');
  // console.log(this);
  // this.populate({ path: 'tour', select: 'name ' });
  this.populate({ path: 'user', select: 'name photo' });
  next();
});
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // console.log(tourId);
  const stats = await this.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: null,
        numRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numRating,
      ratingsAverage: stats[0].avgRating.toFixed(2),
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
// findByIdAndUpdate is short hand for findOne and Update
// findByIdAndDelete is short hand for findOne and delete
reviewSchema.post(/^findOneAnd/, async function (doc, next) {
  // console.log('in post hook after update/delete');
  // console.log(this.constructor == doc);
  // console.log(doc.constructor);
  // console.log(doc);
  try {
    // doc.constructor points to the model which is Review
    // console.log(doc.constructor);
    await doc.constructor.calcAverageRatings(doc.tour);
  } catch (error) {
    return next(new AppError('something went wrong'), 500);
  }
  // console.log(doc.tour);
});
// when a new review is created
reviewSchema.post('save', async function () {
  // this points to current document
  // this.constructor points to the model (Review)
  // Review.calcAverageRatings(currentReviewDocument)
  // console.log(this)

  await this.constructor.calcAverageRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
