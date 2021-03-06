const { User } = require('../models/user')
const usersController = require('./usersController')
const { Expo } = require('expo-server-sdk')
const expo = new Expo();


exports.getAll = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.send({ friends: user.friends, friendRequests: user.friendRequests })
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

exports.sendFriendRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const friendToAdd = await User.findById(req.body.userId)

    if (!friendToAdd) {
      return res.status(400).send({ message: `User with the given id doesn't exist` })
    }

    const friendRequest = user.friendRequests.find(fr => fr._id.toString() === friendToAdd._id.toString())
    if (friendRequest) return res.status(400).send({ message: `You've already sent friend request to this user` })


    const foundFriend = user.friends.find(friend => friend._id.toString() === req.body.userId.toString())
    if (foundFriend) {
      return res.status(400).send({ message: `${friendToAdd.firstName} ${friendToAdd.lastName} already added as a friend` })
    }

    user.friendRequests.push({
      _id: friendToAdd._id,
      email: friendToAdd.email,
      firstName: friendToAdd.firstName,
      lastName: friendToAdd.lastName,
      requestedByMe: true
    })
    friendToAdd.friendRequests.push({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    })
    user.save()
    friendToAdd.save()
    const notificationMessage = `${user.firstName} ${user.lastName} sent you a friend request`
    await sendPushNotification(friendToAdd, notificationMessage)
    const message = `Successfully sent friend request to ${friendToAdd.firstName} ${friendToAdd.lastName}`
    res.send({ message })
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

exports.respondToFriendRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const friendToAdd = await User.findById(req.body.userId)
    const accept = req.body.accept

    if (!friendToAdd) {
      return res.status(400).send({ message: `User with the given id doesn't exist` })
    }

    const friendRequest = user.friendRequests.find(fr => fr._id.toString() === friendToAdd._id.toString())
    if (!friendRequest) return res.status(400).send({ message: `User didn't send you friend request` })
    if (friendRequest.requestedByMe && accept) return res.status(400).send({ message: `You cannot accept your own friend request, come on man...` })

    const foundFriend = user.friends.find(friend => friend._id.toString() === req.body.userId.toString())
    if (foundFriend) {
      return res.status(400).send({ message: `${friendToAdd.firstName} ${friendToAdd.lastName} already added as a friend` })
    }

    if (accept) {
      user.friends.push({
        _id: friendToAdd._id,
        email: friendToAdd.email,
        firstName: friendToAdd.firstName,
        lastName: friendToAdd.lastName
      })
      friendToAdd.friends.push({
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      })
    }
    user.friendRequests = user.friendRequests.filter(fr => fr._id.toString() !== friendToAdd._id.toString())
    friendToAdd.friendRequests = friendToAdd.friendRequests.filter(fr => fr._id.toString() !== user._id.toString())
    user.save()
    friendToAdd.save()
    const notificationMessage = `${user.firstName} ${user.lastName} ${accept ? 'accepted' : 'declined'} your friend request`
    await sendPushNotification(friendToAdd, notificationMessage)
    const message = `Successfully ${accept ? 'added' : 'declined'} ${friendToAdd.firstName} ${friendToAdd.lastName} as a friend`
    res.send({ message })
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const friendToRemove = await User.findById(req.body.userId)

    if (!friendToRemove) {
      return res.status(400).send({ message: `User with the given id doesn't exist` })
    }

    const foundFriendIndex = user.friends.findIndex(friend => friend._id.toString() === req.body.userId.toString())
    if (foundFriendIndex === -1) {
      return res.status(400).send({ message: `${friendToRemove.firstName} ${friendToRemove.lastName} is not a friend` })
    }

    const friendsIndexOfMe = friendToRemove.friends.findIndex(friend => friend._id.toString() === user._id.toString())
    user.friends.splice(foundFriendIndex, 1)
    friendToRemove.friends.splice(friendsIndexOfMe, 1)
    user.save()
    friendToRemove.save()
    const message = `Successfully removed ${friendToRemove.firstName} ${friendToRemove.lastName} from friends list`
    res.send({ message })
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

exports.searchUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const text = req.query.text
    const offset = parseInt(req.query.offset)
    const limit = parseInt(req.query.limit)

    const textTokens = text.split(' ')
    const firstNameToken = textTokens[0] && !textTokens[0].includes('@') ? textTokens[0] : ''
    const lastNameToken = textTokens[1] ? textTokens[1] : ''
    const emailToken = textTokens[0] && textTokens[0].includes('@') ? textTokens[0] : ''

    const users = await User.find({ $and: [
        {firstName: new RegExp('^' + firstNameToken, 'i')},
        {lastName: new RegExp('^' + lastNameToken, 'i')},
        {email: new RegExp('^' + emailToken, 'i')}
      ]})
      .limit(limit)
      .skip(offset * limit)
      .select(['firstName', 'lastName', 'email', 'friends'])

    const result = users.slice(0, 50).map(u => ({
      _id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      isFriend: !!u.friends.find(f => f._id.toString() === user._id.toString())
    }))

    res.send(result)
  } catch (err) {
    console.log(err)
  }
}

const sendPushNotification = async (receiver, body) => {
  const user = await usersController.findUserById(receiver._id)
  if (user && Expo.isExpoPushToken(user.notificationToken)) {
    await expo.sendPushNotificationsAsync([{
      to: user.notificationToken,
      sound: 'default',
      title: 'Friend request',
      body
    }])
  }
}
