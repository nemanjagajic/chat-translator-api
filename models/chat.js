const mongoose = require('mongoose')

const chatUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  showOriginalMessages: Boolean,
  sendLanguage: String,
  receiveLanguage: String
})

const lastMessageSchema = new mongoose.Schema({
  text: {
    type: String,
  },
  createdAt: {
    type: Date,
    required: true
  }
})

const chatSchema = new mongoose.Schema({
  users: [chatUserSchema],
  lastMessage: {
    type: lastMessageSchema,
    default: {
      text: null,
      createdAt: new Date()
    }
  }
})

const Chat = mongoose.model('Chat', chatSchema)

exports.Chat = Chat
