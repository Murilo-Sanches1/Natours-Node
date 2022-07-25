const crypto = require('crypto');
const moongose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new moongose.Schema({
  name: {
    type: String,
    required: [true, 'O nome é obrigatório'],
  },
  email: {
    type: String,
    required: [true, 'O email é obrigatório'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Insira um email válido'],
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
    required: [true, 'Insira uma senha'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Confirme sua senha'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Senhas não são iguais',
    },
  },
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
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTChanged) {
  if (this.passwordChangedAt) {
    const passwordTimeConverted = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTChanged < passwordTimeConverted;
  }
  return false;
};

userSchema.methods.passwordChangedAfter = function (JWTTimesstamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return changedTimestamp > JWTTimesstamp;
  }
  return false;
};

userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = moongose.model('User', userSchema);

module.exports = User;
