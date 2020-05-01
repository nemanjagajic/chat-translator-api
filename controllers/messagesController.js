const { Chat } = require('../models/chat')
const { ChatMessages, Message } = require('../models/message')
const { User } = require('../models/user')

exports.sendMessage = async (req, res) => {
  const { chatId, text } = req.body

  try {
    const user = await User
      .findById(req.user._id)
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(400).send({ message: `Chat with the given id doesn't exist` })
    }

    const receiver = chat.users.find(u => u._id.toString() !== user._id.toString())

    let chatMessages = await ChatMessages
      .findOne()
      .where('chatId').equals(chatId.toString())
    if (!chatMessages) {
      chatMessages = ChatMessages({
        chatId,
        messages: []
      })
      await chatMessages.save()
    }

    const message = new Message({
      text,
      senderId: user._id,
      receiverId: receiver._id,
      createdAt: new Date()
    })
    chatMessages.messages.push(message)
    await chatMessages.save()

    const responseMessage = `Message successfully sent`
    res.send({ message: responseMessage })
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

exports.getAll = async (req, res) => {
  const chatId = req.query.chatId
  const offset = parseInt(req.query.offset)
  const limit = parseInt(req.query.limit)

  try {
    const user = await User
      .findById(req.user._id)
    const chat = await Chat.findById(chatId)

    const foundUser = chat.users.find(u => u._id.toString() === user._id.toString())
    if (!foundUser) {
      return res.status(401).send({ message: `You are not a participant of this chat` })
    }

    const chatMessages = await ChatMessages
      .findOne()
      .where('chatId').equals(chatId.toString())
      .select(['messages'])

    const messages = chatMessages.messages.slice(offset, offset + limit)
    res.send(messages)
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}
