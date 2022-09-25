const express = require('express')
const app = express()
const socket = require('socket.io')
const usersController = require('./controllers/usersController')
const chatsController = require('./controllers/chatsController')
require('dotenv').config()

require('./startup/cors')(app)
require('./startup/routes')(app)
require('./startup/db')()

const port = process.env.PORT || 8000
const server = app.listen(port, () =>
  console.log(`Listening on port ${port}...`)
)

const io = socket(server)
io.on('connection', socket => {
  socket.on('createUserSession', data => {
    usersController.addSocketToUser(data)
  })

  socket.on('chatMessageSent', async message => {
    const receiver = await usersController.findUserById(message.receiverId)
    if (receiver.socketId) {
      socket.broadcast.to(receiver.socketId).emit('loadMessage', message)
    }
  })

  socket.on('chatSettingChanged', async data => {
    const friend = await usersController.findUserById(data.friend._id)
    if (friend.socketId) {
      socket.broadcast.to(friend.socketId).emit('loadChatSettings', {
        chatId: data._id,
        friend: data.me
      })
    }
  })

  socket.on('startedTyping', async data => {
    const friend = await usersController.findUserById(data.friendId)
    if (friend.socketId) {
      socket.broadcast.to(friend.socketId).emit('friendStartedTyping', {
        chatId: data.chatId
      })
    }
  })

  socket.on('stoppedTyping', async data => {
    const friend = await usersController.findUserById(data.friendId)
    if (friend.socketId) {
      socket.broadcast.to(friend.socketId).emit('friendStoppedTyping', {
        chatId: data.chatId
      })
    }
  })

  socket.on('friendVisitedChat', async data => {
    const chat = await chatsController.findById(data.chatId)
    const chatMe = chat.users.find(u => u._id.toString() === data.userId.toString())
    const chatFriend = chat.users.find(u => u._id.toString() !== data.userId.toString())
    const friend = await usersController.findUserById(chatFriend._id)
    if (friend.socketId) {
      socket.broadcast.to(friend.socketId).emit('updateFriendVisitData', {
        chatId: data.chatId,
        newLastVisit: chatMe.lastVisit
      })
    }
  })

  socket.on('friendSentRequest', async userId => {
    const friend = await usersController.findUserById(userId)
    if (friend.socketId) {
      socket.broadcast.to(friend.socketId).emit('newFriendRequest')
    }
  })
})

module.exports = server
