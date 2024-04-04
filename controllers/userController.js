const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const {
  deleteOne,
  updateOne,
  getOne,
  getAll,
} = require('./../controllers/handlerFactory');

// configuring multer storage
// const multerStorage = multer.diskStorage({
//   // storage destination
//   destination: function (req, file, cb) {
//     cb(null, 'public/img/users');
//   },
//   filename: function (req, file, cb) {
//     // user-id-currentTime.extension for unique file name
//     const ext = file.mimetype.split('/')[1]; // mimetype : img/jpg
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();

// configuring multer filter
const multerFilter = (req, file, cb) => {
  // check for image type of file
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('not an image. please upload only images', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = (req, res, next) => {
  // console.log(req.file);

  /* since we decided to save the image to memory instead of writing it to 
  disk as it would take more resources and is slow. Also the filename is now not saved on
  the req.file hence we need to define it specifically as our updateMe is going to use that. 
  */

  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // Image processing, resizing,formatting,quality,storing
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  console.log(req.file);
  next();
};
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
  // console.log(req.file);
  // console.log(req.body);
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
  if (req.file) {
    filteredBody.photo = req.file.filename;
  }
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
