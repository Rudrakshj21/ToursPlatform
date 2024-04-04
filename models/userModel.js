const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [
      validator.isEmail,
      'Please ensure that the email is in correct format',
    ],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    // this only works on create /save
    validate: {
      validator: function (currentField) {
        return currentField === this.password;
      },
      message: 'Passwords are not the same 🥲',
    },
  },
  // will be present on only those users who changed the password
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
userSchema.pre('save', async function (next) {
  // when password is not modified exit
  // console.log('in pre save');
  if (!this.isModified('password')) {
    return next();
  }
  //   Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 10);
  //  deleting.... no need to store extra field since it was only used to check if both passwords that user entered were same
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', function (next) {
  // console.log('in pre save 2');
  // this.isNew takes to long alternative is !this._id
  // console.log(this.$isNew);
  if (this.$isNew || !this.isModified('password')) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000;
  // console.log('pre save 2 done');
  next();
});
userSchema.pre(/^find/, function (next) {
  // if it is an inactive user (active : false) then do not show up

  // console.log('in query middleware of users');
  this.find({ active: { $ne: false } });
  next();
});
userSchema.methods.checkPassword = async (string, hash) => {
  // console.log({ string }, { hash });
  const result = await bcrypt.compare(string, hash);
  console.log(result);
  return result;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // both should be in same format to compare
    // converting to seconds (/1000) and to integer
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    // console.log(
    //   `token issued at ${JWTTimestamp} , password changed at ${changedTimeStamp}`,
    // );
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  //  always better to encrypt

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
