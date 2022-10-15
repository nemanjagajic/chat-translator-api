const { User } = require('../models/user')
const { Chat } = require('../models/chat')

exports.create = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const friend = user.friends.find(f => f._id.toString() === req.body.userId.toString())

    if (!friend) {
      return res.status(400).send({ message: `Friend with the given id doesn't exist` })
    }

    const existingChatCombination1 = await Chat
      .findOne({ users: [user, friend] })

    const existingChatCombination2 = await Chat
      .findOne({ users: [friend, user] })

    if (existingChatCombination1 || existingChatCombination2) {
      return res.status(400).send({ message: `Chat with the given friend already exists` })
    }

    const chat = new Chat({
      users: [user, friend]
    })
    await chat.save()
    res.send(chat)
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

exports.getAll = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const showRemovedFriends = req.query.showRemovedFriends

    const chatUser = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    }

    const chats = await Chat
      .find({ users: { $elemMatch: chatUser }})
      .where()
      .sort('-lastMessage.createdAt')

    const chatsWithUsers = []
    for (const chat of chats) {
      const friend = chat.users.find(u => u._id.toString() !== user._id.toString())
      const me = chat.users.find(u => u._id.toString() === user._id.toString())

      const isFriend = !!user.friends.find(f => f._id.toString() === friend._id.toString())
      if (isFriend || showRemovedFriends === 'true') {
        chatsWithUsers.push({
          _id: chat._id,
          lastMessage: chat.lastMessage,
          friend,
          me
        })
      }
    }

    res.send(chatsWithUsers)
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

exports.setSettingsProperty = async (req, res) => {
  try {
    const { property, value } = req.body
    if (!['showOriginalMessages', 'sendLanguage', 'receiveLanguage'].includes(property)) {
      res.status(400).send({
        message: `Wrong property. Available ones are: "showOriginalMessages", "setLanguage", "receiveLanguage"`
      })
    }

    const user = await User.findById(req.user._id)
    const chat = await Chat.findById(req.body.chatId)

    if (!chat) res.status(404).send({ message: `Chat with the given id doesn't exist` })
    const me = chat.users.find(u => u._id.toString() === user._id.toString())
    const friend = chat.users.find(u => u._id.toString() !== user._id.toString())
    if (!me) return res.status(401).send({ message: `You are not a member of this chat` })

    me[property] = value
    await chat.save()
    res.send({
      _id: chat._id,
      me,
      friend
    })
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

exports.setChatVisited = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const chat = await Chat.findById(req.body.chatId)

    if (!chat) res.status(404).send({ message: `Chat with the given id doesn't exist` })
    const me = chat.users.find(u => u._id.toString() === user._id.toString())
    if (!me) return res.status(401).send({ message: `You are not a member of this chat` })

    me.lastVisit = new Date()
    await chat.save()
    res.send(chat)
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

exports.findById = async id => {
  try {
    return Chat.findById(id)
  } catch (error) {
    console.log(error)
  }
}
