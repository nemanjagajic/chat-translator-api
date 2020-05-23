const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  textTranslated: {
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

const Message = mongoose.model('Message', messageSchema)

exports.Message = Message
