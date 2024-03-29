const jwt = require('jsonwebtoken')
const Joi = require('joi')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  socialId: {
    type: String,
    default: null
  },
  friends: {
    type: Array,
    default: []
  },
  friendRequests: {
    type: Array,
    default: []
  },
  socketId: {
    type: String
  },
  notificationToken: {
    type: String
  }
})

userSchema.methods.generateAuthToken = function() {
  return jwt.sign({
    _id: this._id
  },
    process.env.JWT_PRIVATE_KEY
  )
}

const User = mongoose.model('User', userSchema)

function validateUser(user) {
  const schema = {
    email: Joi.string()
      .required(),
    password: Joi.string()
      .min(8)
      .max(1024)
      .required(),
    firstName: Joi.string(),
    lastName: Joi.string()
  }

  return Joi.validate(user, schema)
}

exports.User = User
exports.validate = validateUser
