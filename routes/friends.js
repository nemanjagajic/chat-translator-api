const express = require('express')
const router = express.Router()
const friendsController = require('../controllers/friendsController')
const authMiddleware = require('../middleware/auth')

router.get('/', authMiddleware, friendsController.getAll)
router.post('/add', authMiddleware, friendsController.add)
router.delete('/remove', authMiddleware, friendsController.remove)

module.exports = router
