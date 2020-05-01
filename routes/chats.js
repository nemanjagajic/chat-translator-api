const express = require('express')
const router = express.Router()
const chatsController = require('../controllers/chatsController')
const authMiddleware = require('../middleware/auth')

router.post('/create', authMiddleware, chatsController.create)

module.exports = router
