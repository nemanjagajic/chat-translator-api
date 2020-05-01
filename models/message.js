const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  receiverId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true
  }
})

const chatMessagesSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true
  },
  messages: [messageSchema]
})

const Message = mongoose.model('Message', messageSchema)
const ChatMessages = mongoose.model('ChatMessages', chatMessagesSchema)

exports.Message = Message
exports.ChatMessages = ChatMessages
