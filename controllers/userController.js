const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const {
  deleteOne,
  updateOne,
  getOne,
  getAll,
} = require('./../controllers/handlerFactory');

exports.getAllUsers = getAll(User);
exports.getUser = getOne(User);
exports.updateUser = updateOne(User);
exports.deleteUser = deleteOne(User);

const filterObj = (userObj, ...properties) => {
  const result = {};
  Object.keys(userObj).forEach((key) => {
    if (properties.includes(key)) {
      result[key] = userObj[key];
    }
  });
  return result;
};
exports.setUserId = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.aboutMe = getOne(User);
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTS password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updating. Please use /updatePassword',
        400,
      ),
    );
  }
  // 2 remove unwanted fields which are not to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  // 3 update the user document
  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  // console.log({ user });

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.deleteMe = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });
  // console.log(user);
  res.status(204).json({ status: 'success' });
});
exports.createUser = catchAsync((req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined Please use /signup instead.  ',
  });
});
