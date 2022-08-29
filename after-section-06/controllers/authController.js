const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const webToken = require('jsonwebtoken');
const AppError = require('../utils/appError');

const signToken = id => {
  return webToken.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // if the email or passsword exists
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }

  // if the user exists and password is correct
  // note that the user will give password non encrypted and we have to compare it with the encrypted using bcrypt package
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('either email or password is incorrect!', 401));
  }

  // send token to client if everything is ok
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // getting token and check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('you are not logged in please login to get access.', 401)
    );
  }

  // verification token
  const decoded = await promisify(webToken.verify)(
    token,
    process.env.JWT_SECRET
  );

  // check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('the user belonging to this token no longer exists', 401)
    );
  }

  //check if the user has changed password after the token is issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('user recently changed password please log in again', 401)
    );
  }

  req.user = currentUser;
  next();
});
