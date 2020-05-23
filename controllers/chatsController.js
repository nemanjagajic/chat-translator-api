const { User } = require('../models/user')
const { Chat } = require('../models/chat')
const mongoose = require('mongoose')

const db = mongoose.connection

exports.create = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const friend = user.friends.find(f => f._id.toString() === req.body.userId.toString())

    if (!friend) {
      return res.status(400).send({ message: `Friend with the given id doesn't exist` })
    }

    const existingChatCombination1 = await Chat
      .findOne({ users: [user, friend] })

    const existingChatCombination2 = await Chat
      .findOne({ users: [friend, user] })

    if (existingChatCombination1 || existingChatCombination2) {
      return res.status(400).send({ message: `Chat with the given friend already exists` })
    }

    const chat = new Chat({
      users: [user, friend]
    })
    await chat.save()
    res.send(chat)
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

exports.getAll = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    const chatUser = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    }

    const chats = await Chat
      .find({ users: { $elemMatch: chatUser }, 'lastMessage.text' :{ $ne:null } })
      .where()
      .sort('-lastMessage.createdAt')

    const chatsWithUsers = []
    for (const chat of chats) {
      const friend = chat.users.find(u => u._id.toString() !== user._id.toString())
      const me = chat.users.find(u => u._id.toString() === user._id.toString())

      chatsWithUsers.push({
        _id: chat._id,
        lastMessage: chat.lastMessage,
        friend,
        me
      })
    }

    res.send(chatsWithUsers)
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

exports.setSettingsProperty = async (req, res) => {
  try {
    const { property, value } = req.body
    if (!['showOriginalMessages', 'sendLanguage', 'receiveLanguage'].includes(property)) {
      res.status(400).send({
        message: `Wrong property. Available ones are: "showOriginalMessages", "setLanguage", "receiveLanguage"`
      })
    }

    const user = await User.findById(req.user._id)
    const chat = await Chat.findById(req.body.chatId)

    if (!chat) res.status(404).send({ message: `Chat with the given id doesn't exist` })
    const me = chat.users.find(u => u._id.toString() === user._id.toString())
    if (!me) return res.status(401).send({ message: `You are not a member of this chat` })

    me[property] = value
    await chat.save()
    res.send(chat)
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}
