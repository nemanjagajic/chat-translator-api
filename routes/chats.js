const express = require('express')
const router = express.Router()
const chatsController = require('../controllers/chatsController')
const authMiddleware = require('../middleware/auth')

router.get('/', authMiddleware, chatsController.getAll)
router.post('/create', authMiddleware, chatsController.create)
router.post('/setSettingsProperty', authMiddleware, chatsController.setSettingsProperty)

module.exports = router
