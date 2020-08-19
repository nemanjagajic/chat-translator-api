const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const authMiddleware = require('../middleware/auth')
// const formidable = require('express-formidable')

router.post('/register', usersController.register)
router.post('/login', usersController.login)
router.post('/loginWithGoogle', usersController.loginWithGoogle)
router.get('/me', authMiddleware, usersController.me)
router.post('/registerNotificationToken', authMiddleware, usersController.registerNotificationToken)

// In case we want to have update user route in future
// router.post('/updateUser', [authMiddleware, formidable()], usersController.updateUser)

module.exports = router
