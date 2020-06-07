const express = require('express')
const router = express.Router()
const friendsController = require('../controllers/friendsController')
const authMiddleware = require('../middleware/auth')

router.get('/', authMiddleware, friendsController.getAll)
router.post('/acceptFriendRequest', authMiddleware, friendsController.acceptFriendRequest)
router.delete('/remove', authMiddleware, friendsController.remove)
router.post('/sendFriendRequest', authMiddleware, friendsController.sendFriendRequest)

module.exports = router
