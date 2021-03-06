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
  showOriginalMessages: {
    type: Boolean,
    default: true
  },
  sendLanguage: String,
  receiveLanguage: String,
  lastVisit: Date
})

const lastMessageSchema = new mongoose.Schema({
  text: {
    type: String
  },
  textTranslated: {
    type: String
  },
  createdAt: {
    type: Date,
    required: true
  },
  senderId: {
    type: String
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
