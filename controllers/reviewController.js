const Review = require('./../models/reviewModel');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./../controllers/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.setTourUserId = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.tourId;
  next();
};
exports.checkDuplicateReview = catchAsync(async (req, res, next) => {
  const review = await Review.find({
    tour: req.body.tour,
    user: req.body.user,
  });
  console.log(review);
  if (review.length > 0) {
    return next(new AppError('A review for this tour by You already exists'));
  }
  next();
});
exports.getReviews = getAll(Review);
exports.getReview = getOne(Review);
exports.createReview = createOne(Review);
exports.deleteReview = deleteOne(Review);
exports.updateReview = updateOne(Review);
