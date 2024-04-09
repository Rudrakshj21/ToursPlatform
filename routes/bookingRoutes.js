const express = require('express');
const { protect, restrictTo } = require('./../controllers/authController');
const {
  getCheckoutSession,
  getBooking,
  getAllBooking,
  createBooking,
  updateBooking,
  deleteBooking,
} = require('./../controllers/bookingController');

const router = express.Router();

router.get('/checkout-session/:tourID', protect, getCheckoutSession);
router.use(protect, restrictTo('admin', 'lead-guide'));
router.route('/').get(getAllBooking).post(createBooking);
router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
