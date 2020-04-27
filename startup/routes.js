const express = require('express')
const auth = require('../routes/auth')
const friends = require('../routes/friends')

module.exports = app => {
  app.use(express.json())
  app.use('/api/auth', auth)
  app.use('/api/friends', friends)
}
