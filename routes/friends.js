const express = require('express')
const router = express.Router()
const friendsController = require('../controllers/friendsController')
const authMiddleware = require('../middleware/auth')

router.get('/', authMiddleware, friendsController.getAll)
router.post('/respondToFriendRequest', authMiddleware, friendsController.respondToFriendRequest)
router.delete('/remove', authMiddleware, friendsController.remove)
router.post('/sendFriendRequest', authMiddleware, friendsController.sendFriendRequest)
router.get('/searchUser', authMiddleware, friendsController.searchUser)


module.exports = router
