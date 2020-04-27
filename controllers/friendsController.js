const { User } = require('../models/user')

exports.add = async (req, res) => {
  try {
    const user = await User
      .findById(req.user._id)
    const friendToAdd = await User
      .findById(req.body.userId)

    if (!friendToAdd) {
      return res.status(400).send({ message: `User with the given id doesn't exist` })
    }

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
    friendToAdd.friends.push({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    })
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
    const user = await User
      .findById(req.user._id)
    const friendToRemove = await User
      .findById(req.body.userId)

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
