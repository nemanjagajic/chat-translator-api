const { User, validate } = require('../models/user')
const bcrypt = require('bcrypt')
const axios = require('axios')
const fs = require('fs')
const fsExtra = require('fs-extra')
const sharp = require('sharp')
const cryptoRandomString = require('crypto-random-string')
const { AVATAR_HEIGHT, AVATAR_WIDTH } = require('../constants/userConstants')
const { VALIDATE_ACCESS_TOKEN_URL } = require('../constants/googleConstants')
const { PASSWORD_LENGTH } = require('../constants/userConstants')

exports.register = async (req, res) => {
  const { error } = validate(req.body)
  if (error) return res.status(400).send({ message: error.details[0].message })

  let user = await User.findOne({ email: req.body.email })
  if (user) return res.status(400).send({ message: 'User already registered.' })

  const userData = {
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  }

  user = await registerUser(userData)

  const token = user.generateAuthToken()
  res.send({ token })
}

async function registerUser(userData) {
  const user = new User({
    email: userData.email,
    password: userData.password,
    firstName: userData.firstName,
    lastName: userData.lastName,
    socialId: userData.socialId || null
  })

  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(user.password, salt)
  return user.save()
}

exports.login = async (req, res) => {
  const { error } = validate(req.body)
  if (error) return res.status(400).send({ message: error.details[0].message })

  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(400).send({ message: 'Invalid email or password.' })

  const validPassword = await bcrypt.compare(req.body.password, user.password)
  if (!validPassword) return res.status(400).send({ message: 'Invalid email or password.' })

  const token = user.generateAuthToken()
  res.send({ token, _id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName })
}

exports.loginWithGoogle = async (req, res) => {
  const accessToken = req.body.accessToken
  try {
    const { data: { email, given_name, family_name, id } } = await axios.get(`${VALIDATE_ACCESS_TOKEN_URL}${accessToken}`)
    let user = await User.findOne({ socialId: id })

    if (!user) {
      const generatedPassword = cryptoRandomString({length: PASSWORD_LENGTH, type: 'base64'})
      const userData = {
        email,
        password: generatedPassword,
        firstName: given_name,
        lastName: family_name,
        socialId: id
      }
      user = await registerUser(userData)
    }

    const token = user.generateAuthToken()
    const { _id, firstName, lastName } = user
    res.send({ token, _id, email, firstName, lastName })
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

exports.me = async (req, res) => {
  try {
    const user = await User
      .findById(req.user._id)
      .select(['email'])
    res.send(user)
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

exports.addSocketToUser = async data => {
  try {
    const { userId, socketId } = data
    let user = await User.findById(userId)
    user.socketId = socketId
    await user.save()
    return user
  } catch (err) {
    console.log(err)
  }
}

exports.registerNotificationToken = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    user.notificationToken = req.body.token
    await user.save()
    res.send(user)
  } catch (err) {
    console.log(err)
  }
}

exports.findUserById = async userId => {
  try {
    return User.findById(userId)
  } catch (err) {
    console.log(err)
  }
}

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const userAvatarName = `./avatarImages/${user._id}`
    const { path, name } = req.files.avatar
    const nameTokens = name.split('.')
    const extension = nameTokens[nameTokens.length - 1]
    const userAvatarFileName = `${userAvatarName}.${extension}`

    await sharp(path)
      .resize(AVATAR_HEIGHT, AVATAR_WIDTH)
      .toFile(userAvatarFileName)

    const message = `Successfully uploaded image ${userAvatarFileName}`
    res.send({ message })
  } catch (err) {
    console.log(err)
  }
}
