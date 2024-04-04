const express = require('express');
const router = express.Router();
const {
  getOverview,
  getTour,
  getLoginForm,
  getUserAccount,
  updateUserData,
} = require('./../controllers/viewsController');
const { isLoggedIn, protect } = require('./../controllers/authController');

router.get('/', isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/me', protect, getUserAccount);
router.post('/submit-user-data',protect, updateUserData);
module.exports = router;
