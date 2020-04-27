const jwt = require('jsonwebtoken')

module.exports = function(req, res, next) {
  const token = req.headers.authorization
  if (!token) return res.status(401).send({ message: 'Access denied. No token provided.' })

  try {
    req.user = jwt.verify(req.headers.authorization, process.env.JWT_PRIVATE_KEY)
    next()
  } catch (ex) {
    res.status(400).send({ message: 'Invalid token.' })
  }
}
