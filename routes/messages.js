const express = require('express')
const router = express.Router()
const messagesController = require('../controllers/messagesController')
const authMiddleware = require('../middleware/auth')

router.post('/', authMiddleware, messagesController.sendMessage)
router.get('/', authMiddleware, messagesController.getAll)

module.exports = router
