const express = require('express');
//each router by default has access to parameters of their specific routes
// with merge params set to true and we are redirecting to this review router
// POST /tours/12a2/reviews
// GET /tours/12a2/reviews
// POST /reviews
// we will get to this router only
const router = express.Router({ mergeParams: true });
const { protect, restrictTo } = require('./../controllers/authController');
const {
  createReview,
  getReviews,
  deleteReview,
  updateReview,
  setTourUserId,
  getReview,
  checkDuplicateReview,
} = require('./../controllers/reviewController');

router.use(protect);
router
  .route('/')
  .get(getReviews)
  .post(restrictTo('user'), setTourUserId, checkDuplicateReview, createReview);

router
  .route('/:id')
  .get(restrictTo('user'), getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);
module.exports = router;
