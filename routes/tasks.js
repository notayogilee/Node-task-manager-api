const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/taskModel')

// @ route GET /tasks
// @ desc Get all tasks
// @ access Private
router.get('/', auth, async (req, res) => {
  const match = {}
  const sort = {}

  if (req.query.completed) {
    match.completed = req.query.completed === "true"
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    // const tasks = await Task.find({})
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate()
    res.send(req.user.tasks)
  } catch (error) {
    console.error(error)
    res.status(500).send()
  }
})

// @ route GET /tasks/:id
// @ desc Get task by id
// @ access Private
router.get('/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {
    const task = await Task.findOne({ _id, owner: req.user._id })

    if (!task) {
      return res.status(404).send("Task not found")
    }

    res.send(task)
  } catch (error) {
    console.error(error)
    res.status(500).send()
  }
})

// @route POST /tasks
// @desc Create a new task
// @access Private
router.post('/', auth, async (req, res) => {
  const task = await new Task({
    ...req.body,
    owner: req.user._id
  })

  try {
    await task.save()
    res.status(201).json({ task })
  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})

// @route PUT /tasks/:id
// @desc Update a task
// @access Private
router.put('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ["description", "completed"]
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" })
  }
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id })

    if (!task) {
      return res.status(404).send("Task not found")
    }

    updates.forEach((update) => task[update] = req.body[update])
    await task.save()

    const incompleteTasks = await Task.countDocuments({ completed: false })

    res.send(`Task updated. \nYou have ${incompleteTasks} incomplete tasks. \nUpdated task: ${task}`)
  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})

// @route DELETE /tasks/:id
// @desc Delete a task
// @access Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id })

    if (!task) {
      return res.status(404).send('Task not found')
    }

    res.send('Task deleted')
  } catch (error) {
    console.error(error)
    res.status(500).send()
  }
})

module.exports = router