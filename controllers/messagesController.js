const { Chat } = require('../models/chat')
const { Message } = require('../models/message')
const { User } = require('../models/user')
const { TranslationServiceClient } = require('@google-cloud/translate')
const { Expo } = require('expo-server-sdk')
const usersController = require('./usersController')
const mongoose = require('mongoose')
const expo = new Expo();

const db = mongoose.connection

const projectId = process.env.GOOGLE_PROJECT_ID
const location = 'global'

const translationClient = new TranslationServiceClient()

exports.sendMessage = async (req, res) => {
  const { chatId, text } = req.body

  try {
    const user = await User.findById(req.user._id)
    const chat = await Chat.findById(chatId)

    const error = checkChatAndUserPermissions(chat, user)
    if (error) {
      return res.status(error.code).send({ message: error.message })
    }

    const sender = chat.users.find(u => u._id.toString() === user._id.toString())
    const receiver = chat.users.find(u => u._id.toString() !== user._id.toString())

    const collection = await db.collection(`z_messages_${chatId}`)
    const textTranslated = await translateText(
      text,
      sender.sendLanguage,
      receiver.receiveLanguage
    )
    const message = new Message({
      chatId,
      text,
      textTranslated,
      senderId: user._id,
      receiverId: receiver._id,
      createdAt: new Date()
    })

    await collection.insertOne(message)
    chat.lastMessage = {
      _id: message._id,
      text: message.text,
      textTranslated,
      createdAt: message.createdAt,
      senderId: sender._id
    }
    chat.save()

    await sendPushNotification(receiver, message)

    res.send({ message })
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
}

const translateText = async (text, sourceLanguageCode, targetLanguageCode) => {
  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    contents: [text],
    mimeType: 'text/plain',
    sourceLanguageCode,
    targetLanguageCode,
  }

  try {
    const [ response ] = await translationClient.translateText(request)
    return response.translations[0].translatedText
  } catch (error) {
    console.error(error)
  }
}

const sendPushNotification = async (receiver, message) => {
  const user = await usersController.findUserById(receiver._id)
  console.log({ user })
  if (user && Expo.isExpoPushToken(user.notificationToken)) {
    await expo.sendPushNotificationsAsync([{
      to: user.notificationToken,
      sound: 'default',
      title: `${user.firstName} ${user.lastName}`,
      body: message.textTranslated,
      data: { withSome: 'data' },
    }])
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
