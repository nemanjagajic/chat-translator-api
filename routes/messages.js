const express = require('express')
const router = express.Router()
const messagesController = require('../controllers/messagesController')
const authMiddleware = require('../middleware/auth')

router.post('/send', authMiddleware, messagesController.sendMessage)

module.exports = router
