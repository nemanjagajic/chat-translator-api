const { Chat } = require('../models/chat')
const { Message } = require('../models/message')
const { User } = require('../models/user')
const mongoose = require('mongoose')

const db = mongoose.connection

exports.sendMessage = async (req, res) => {
  const { chatId, text } = req.body

  try {
    const user = await User.findById(req.user._id)
    const chat = await Chat.findById(chatId);

    const error = checkChatAndUserPermissions(chat, user)
    if (error) {
      return res.status(error.code).send({ message: error.message })
    }

    const receiver = chat.users.find(u => u._id.toString() !== user._id.toString())

    const collection = await db.collection(`z_messages_${chatId}`)
    const message = new Message({
      chatId,
      text,
      senderId: user._id,
      receiverId: receiver._id,
      createdAt: new Date()
    })
    await collection.insertOne(message)
    chat.lastMessage = {
      _id: message._id,
      text: message.text,
      createdAt: message.createdAt
    }
    chat.save()

    res.send({ message })
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

exports.getAll = async (req, res) => {
  const chatId = req.query.chatId
  const offset = parseInt(req.query.offset)
  const limit = parseInt(req.query.limit)

  try {
    const user = await User.findById(req.user._id)
    const chat = await Chat.findById(chatId)

    const error = checkChatAndUserPermissions(chat, user)
    if (error) {
      return res.status(error.code).send({ message: error.message })
    }

    const collection = await db.collection(`z_messages_${chatId}`)
    const messages = await collection
      .find()
      .limit(limit)
      .skip(offset * limit)
      .sort('createdAt', -1)
      .toArray()

    res.send(messages)
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

const checkChatAndUserPermissions = (chat, user) => {
  if (!chat) {
    return { code: 400, message: `Chat with the given id doesn't exist` }
  }

  const foundUser = chat.users.find(u => u._id.toString() === user._id.toString())
  if (!foundUser) {
    return { code: 401, message: 'You are not a participant of this chat' }
  }

  return null
}
