const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'name is not provided please provide name']
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'email is not provided please provide email'],
    validate: [validator.isEmail, 'please provide a valid email']
  },
  photo: {
    type: String
  },
  password: {
    type: String,
    required: [true, 'password is not inserted please insert password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [
      true,
      'confirm password is not provided please provide confirm password'
    ],
    validate: {
      validator: function(el) {
        return el === this.password;
      }
    }
  },
  passwordChangedAt: Date
});

userSchema.pre('save', async function(next) {
  // only runs if the password is actuallhy modified...(initially it will null or empty so it will return true for modified)
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
