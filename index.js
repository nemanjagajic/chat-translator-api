const express = require('express')
const app = express()
const socket = require('socket.io')
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
  console.log(`Made socket connection ${socket.id}`)

  socket.on('chatMessageSent', message => {
    console.log({ message })
    socket.broadcast.emit('loadMessage', message)
  })
})

module.exports = server
