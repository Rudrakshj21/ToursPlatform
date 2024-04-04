const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  aboutMe,
  setUserId,
} = userController;

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
  logout,
} = authController;

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/forgotPassword').post(forgotPassword);
router.route('/logout').get(logout);
router.route('/resetPassword/:token').patch(resetPassword);
// AUTHORIZATION
router.use(protect);
router.route('/updatePassword').patch(updatePassword);
router.route('/updateMe').patch(updateMe);
router.route('/deleteMe').delete(deleteMe);
router.route('/me').get(setUserId, aboutMe);
// all routes after this middleware can only be used by admin
router.use(restrictTo('admin'));
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
module.exports = router;
