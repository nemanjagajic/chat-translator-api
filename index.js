const express = require('express')
const app = express()
const socket = require('socket.io')
const usersController = require('./controllers/usersController')
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
})

module.exports = server
