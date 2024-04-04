const express = require('express');
const router = express.Router();
const tourController = require('./../controllers/tourController');
const reviewRouter = require('./../routes/reviewRoutes');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances
} = tourController;
const { protect, restrictTo } = require('./../controllers/authController');

// nested routes
// parent (tour resource) child (reviews resource) relationship
// POST /tours/12a2/reviews
// GET /tours/12a2/reviews
// GET /tours/12a2/reviews/123w

// redirecting to review router when we get /:tourId/reviews but review Router will not have access to the tour id
router.use('/:tourId/reviews', reviewRouter);

router.route('/tour-stats').get(getTourStats);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
// /tours-within?distance=233&center=-30,21&unit=km
// /tours-within/233/center/-30,21/unit/km

// calculate distance from a certain point(lat,lng) to all the tours
router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);
module.exports = router;
