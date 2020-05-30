const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const authMiddleware = require('../middleware/auth')

router.post('/register', usersController.register)
router.post('/login', usersController.login)
router.post('/loginWithGoogle', usersController.loginWithGoogle)
router.get('/me', authMiddleware, usersController.me)
router.post('/registerNotificationToken', authMiddleware, usersController.registerNotificationToken)

module.exports = router
