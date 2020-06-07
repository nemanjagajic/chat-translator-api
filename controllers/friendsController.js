const { User } = require('../models/user')

exports.getAll = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.send(user.friends)
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
    const message = `Successfully sent friend request to ${friendToAdd.firstName} ${friendToAdd.lastName}`
    res.send({ message })
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

exports.acceptFriendRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const friendToAdd = await User.findById(req.body.userId)

    if (!friendToAdd) {
      return res.status(400).send({ message: `User with the given id doesn't exist` })
    }

    const friendRequest = user.friendRequests.find(fr => fr._id.toString() === friendToAdd._id.toString())
    if (!friendRequest) return res.status(400).send({ message: `User didn't send you friend request` })
    if (friendRequest.requestedByMe) return res.status(400).send({ message: `You cannot accept your own friend request, come on man...` })

    const foundFriend = user.friends.find(friend => friend._id.toString() === req.body.userId.toString())
    if (foundFriend) {
      return res.status(400).send({ message: `${friendToAdd.firstName} ${friendToAdd.lastName} already added as a friend` })
    }

    user.friends.push({
      _id: friendToAdd._id,
      email: friendToAdd.email,
      firstName: friendToAdd.firstName,
      lastName: friendToAdd.lastName
    })
    user.friendRequests = user.friendRequests.filter(fr => fr._id.toString() !== friendToAdd._id.toString())
    friendToAdd.friends.push({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    })
    friendToAdd.friendRequests = friendToAdd.friendRequests.filter(fr => fr._id.toString() !== user._id.toString())
    user.save()
    friendToAdd.save()
    const message = `Successfully added ${friendToAdd.firstName} ${friendToAdd.lastName} as a friend`
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

    user.friends.splice(foundFriendIndex, 1)
    const friendsIndexOfMe = user.friends.findIndex(friend => friend._id.toString() === req.user._id)
    friendToRemove.friends.splice(friendsIndexOfMe, 1)
    user.save()
    friendToRemove.save()
    const message = `Successfully removed ${friendToRemove.firstName} ${friendToRemove.lastName} from friends list`
    res.send({ message })
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}
