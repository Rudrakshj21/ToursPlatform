const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    // browser can only send and store and not modify
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    // only https encrypted connection
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);
  // console.log('before cookie')
  // console.log(res.cookie);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  // console.log('in signup');
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });
  // console.log('created ');
  // do not want the password in response.
  newUser.password = undefined;
  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // console.log('in login');
  // console.log(req.body)
  const { email, password } = req.body;
  // 1 check if email or password exits
  if (!email || !password) {
    // send error to global handling middleware
    return next(new AppError('Please provide valid email and password', 401));
  }

  // 2 check if user exists && password is correct
  // console.log(email, password);
  const user = await User.findOne({ email: email }).select('+password');
  // user.password is the hashed password
  // console.log(user);
  // console.log(req.body.password, user.password);
  if (!user || !(await user.checkPassword(req.body.password, user.password))) {
    return next(new AppError('Incorrect email or password', 400));
  }

  createAndSendToken(user, 200, res);
});

exports.logout = async (req, res, next) => {
  /* since we are using http only cookie in browser we cannot delete or remove it from browser and clever workaround this is 
  to send cookie with same name jwt but without the token this way the existing cookie with token is
  overridden and  the secured routes will not be accessible and also this cookie 
  will have a short expiration time*/

  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  };
  res.cookie('jwt', 'logged out ', cookieOptions);

  res.status(200).json({ status: 'success' });
};
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get the token
  // console.log('in protect');
  let token;
  // console.log(req.headers.authorization);
  // for api
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // console.log('in token');
    token = req.headers.authorization.replace('Bearer ', '');
    // console.log(token);
    // from frontend
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    next(
      new AppError(
        'You are not logged in! Please login to get access.....',
        401,
      ),
    );
  }

  // 2) verification token

  const decodedPayload = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );

  //3) check if user exits

  // console.log(decodedPayload);

  const currentUser = await User.findById({
    _id: decodedPayload.id,
  });

  // console.log(currentUser);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to the token no longer exists', 401),
    );
  }
  // 4) check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decodedPayload.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again', 401),
    );
  }

  // GRANT ACCESS TO THE PROTECTED ROUTE
  req.user = currentUser;

  // Since this middleware is protecting getAccount which is rendered on webpage using current user detail
  res.locals.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles = ['admin','lead-guide']
    // roles is an array which can be accessed inside our function cause of closure
    if (!roles.includes(req.user.role)) {
      next(
        new AppError('You do not have permission to perform this action', 403),
      );
      // 403 forbidden
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on  email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = await user.createPasswordResetToken();
  console.log(resetToken);
  await user.save({ validateBeforeSave: false });
  console.log('saved');
  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500,
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //  check if user exists and reset token has not expired yet.
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  // set user password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  // update the passwordChangeAt property
  // better to change it using pre hook and it could be used for update password route in future
  // user.passwordChangedAt = Date.now();

  // save user data with validation
  await user.save();

  // log the user in send jwt

  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //  get password from collection
  const user = await User.findById(req.user._id).select('+password');

  // console.log(user);
  // check if posted password is correct

  if (!(await user.checkPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('password is incorrect'));
  }

  // update password
  user.password = req.body.updatePassword;
  user.passwordConfirm = req.body.updatePasswordConfirm;
  await user.save();
  // findUserByIdAndUpdate will not work as intended
  createAndSendToken(user, 200, res);
});

// only for rendered pages , no error
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //  verification  of token
      // console.log(req.cookies.jwt);
      const decodedPayload = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // check if user exits

      const currentUser = await User.findById({
        _id: decodedPayload.id,
      });

      // console.log(currentUser);
      if (!currentUser) {
        return next();
      }
      //  check if user changed password after token was issued
      if (currentUser.changedPasswordAfter(decodedPayload.iat)) {
        return next();
      }

      // There is a logged in user
      // all pug templates will have access to user variable
      res.locals.user = currentUser;
    } catch (error) {
      return next();
    }
  }
  next();
};


