const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1 get tour data from collection
  const tours = await Tour.find();
  // 2 build template
  // console.log(tours[0]);
  // 3 render that template using data from step 1

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  // console.log(req.params);
  console.log('in get tour');
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name'), 404);
  }
  // console.log(tour);
  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your Account ',
  });
});

exports.getUserAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account');
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  // console.log('in update user data');
  // console.log(req.user);
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    { runValidators: true, new: true }, //since user is logged in
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
