const express = require('express')
const auth = require('../routes/auth')

module.exports = app => {
  app.use(express.json())
  app.use('/api/auth', auth)
}
