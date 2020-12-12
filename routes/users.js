const express = require('express')
const auth = require('../middleware/auth')
const router = express.Router()
const User = require('../models/userModel.js')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')

// @route GET /users
// @desc Get all users
// @access Private
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({})

    res.send(users)
  } catch (error) {
    console.error(error)
    res.status(500).send()
  }
})

// @route GET /users/me
// @desc Get user profile when authenticated
// @access Private
router.get('/me', auth, (req, res) => {
  res.send(req.user)
})

// @route POST /users
// @desc Register a user
// @access Public
router.post('/', async (req, res) => {

  try {
    const user = await new User(req.body)
    const token = await user.generateAuthToken()
    await user.save()
    sendWelcomeEmail(user.email, user.name)
    res.status(201).send({ user, token })
  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})

// @route POST /login
// @desc Login a user
// @access Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findByCredentials(email, password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (error) {
    console.error(error)
    res.status(400).send('Credentials do not match')
  }
})

// @route POST /users/logout
// @desc Log out a user
// @access Private
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })

    await req.user.save()
    res.send("You have been logged out")
  } catch (error) {
    res.send(500).send()
  }
})

// @route POST /users/logoutAll
// @desc Log out a user from all devices ( remove all tokens )
// @access Private
router.post('/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send("You have been logged out of all devices")
  } catch (error) {
    res.send(500).send()
  }
})


// @route PUT /users/:id
// @desc Update a user
// @access Private
router.put('/me', auth, async (req, res) => {
  const _id = req.user._id

  // ensure updating existing key
  const updates = Object.keys(req.body)
  const allowedUpdates = ["name", "email", "password", "age"]
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" })
  }

  try {
    updates.forEach((update) => req.user[update] = req.body[update])

    await req.user.save()

    res.send(req.user)

  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})

// @route DELETE /users/:id
// @desc Delete a user
// @access Private
router.delete('/me', auth, async (req, res) => {
  const _id = req.user._id

  try {
    sendCancelationEmail(req.user.email, req.user.name)
    await req.user.remove()
    res.send(`User deleted: \n${req.user}`)
  } catch (error) {
    console.error(error)
    res.status(500).send()
  }
})
// upload image with multer
const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only jpg, jpeg, or png files allowed'))
    }
    cb(undefined, true)
  }
})

// @route POST /users/me/avatar
// @desc Create an avatar
// @access Private
router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

  req.user.avatar = buffer
  await req.user.save()
  res.send('Profile avatar added')
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

// @route DELETE /users/me/avatar
// @desc Delete a users avatar
// @access Private
router.delete('/me/avatar', auth, (req, res) => {
  req.user.avatar = undefined
  req.user.save()
  res.send('Avatar deleted')
})

router.get('/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar) {
      throw new Error()
    }

    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
  } catch (error) {
    res.status(404).send()
  }
})

module.exports = router