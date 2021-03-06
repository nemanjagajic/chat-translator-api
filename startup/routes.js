const express = require('express')
const auth = require('../routes/auth')
const friends = require('../routes/friends')
const chats = require('../routes/chats')
const messages = require('../routes/messages')

module.exports = app => {
  app.use(express.json())
  // app.use('/avatarImages', express.static(process.cwd() + '/avatarImages'))
  app.use('/api/auth', auth)
  app.use('/api/friends', friends)
  app.use('/api/chats', chats)
  app.use('/api/messages', messages)
}
