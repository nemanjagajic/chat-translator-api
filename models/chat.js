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
  }
})

const chatSchema = new mongoose.Schema({
  users: [chatUserSchema]
})

const Chat = mongoose.model('Chat', chatSchema)

exports.Chat = Chat
exports.chatUserSchema = chatUserSchema
