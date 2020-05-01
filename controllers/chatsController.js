const { User } = require('../models/user')
const { Chat } = require('../models/chat')

exports.create = async (req, res) => {
  try {
    const user = await User
      .findById(req.user._id)
    const friend = user.friends.find(f => f._id.toString() === req.body.userId.toString())

    if (!friend) {
      return res.status(400).send({ message: `Friend with the given id doesn't exist` })
    }

    const existingChatCombination1 = await Chat
      .findOne()
      .where('userOne._id').equals(user._id.toString())
      .where('userTwo._id').equals(friend._id.toString())
      .exec()

    const existingChatCombination2 = await Chat
      .findOne()
      .where('userOne._id').equals(friend._id.toString())
      .where('userTwo._id').equals(user._id.toString())
      .exec()

    if (existingChatCombination1 || existingChatCombination2) {
      return res.status(400).send({ message: `Chat with the given friend already exists` })
    }

    const chat = new Chat({
      userOne: user,
      userTwo: friend
    })
    await chat.save()
    res.send(chat)
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}
