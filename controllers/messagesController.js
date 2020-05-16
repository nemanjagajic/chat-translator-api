const { Chat } = require('../models/chat')
const { Message } = require('../models/message')
const { User } = require('../models/user')
const { TranslationServiceClient } = require('@google-cloud/translate')
const mongoose = require('mongoose')

const db = mongoose.connection

const projectId = process.env.GOOGLE_PROJECT_ID
const location = 'global'

const translationClient = new TranslationServiceClient()
async function translateText(text) {
  console.log(projectId)
  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    contents: [text],
    mimeType: 'text/plain',
    sourceLanguageCode: 'en',
    targetLanguageCode: 'sr-Latn',
  }

  try {
    const [ response ] = await translationClient.translateText(request)
    return response.translations[0].translatedText
  } catch (error) {
    console.error(error)
  }
}

exports.sendMessage = async (req, res) => {
  const { chatId, text } = req.body

  try {
    const user = await User.findById(req.user._id)
    const chat = await Chat.findById(chatId)

    const error = checkChatAndUserPermissions(chat, user)
    if (error) {
      return res.status(error.code).send({ message: error.message })
    }

    const receiver = chat.users.find(u => u._id.toString() !== user._id.toString())

    const collection = await db.collection(`z_messages_${chatId}`)
    const textSr = await translateText(text)
    const message = new Message({
      chatId,
      text,
      textSr,
      senderId: user._id,
      receiverId: receiver._id,
      createdAt: new Date()
    })

    await collection.insertOne(message)
    chat.lastMessage = {
      _id: message._id,
      text: message.text,
      textSr: textSr,
      createdAt: message.createdAt
    }
    chat.save()

    res.send({ message })
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

exports.getAll = async (req, res) => {
  const chatId = req.query.chatId
  const offset = parseInt(req.query.offset)
  const limit = parseInt(req.query.limit)

  try {
    const user = await User.findById(req.user._id)
    const chat = await Chat.findById(chatId)

    const error = checkChatAndUserPermissions(chat, user)
    if (error) {
      return res.status(error.code).send({ message: error.message })
    }

    const collection = await db.collection(`z_messages_${chatId}`)
    const messages = await collection
      .find()
      .limit(limit)
      .skip(offset * limit)
      .sort('createdAt', -1)
      .toArray()

    res.send(messages)
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

const checkChatAndUserPermissions = (chat, user) => {
  if (!chat) {
    return { code: 400, message: `Chat with the given id doesn't exist` }
  }

  const foundUser = chat.users.find(u => u._id.toString() === user._id.toString())
  if (!foundUser) {
    return { code: 401, message: 'You are not a participant of this chat' }
  }

  return null
}
