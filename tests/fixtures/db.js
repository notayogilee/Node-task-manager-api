const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../models/userModel')
const Task = require('../../models/taskModel')
require('dotenv').config()


const userOneId = new mongoose.Types.ObjectId()
const userOne = {
  _id: userOneId,
  name: "Mike",
  email: "mike@gmail.com",
  password: 'test123!',
  tokens: [{
    token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
  }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
  _id: userTwoId,
  name: "Claire",
  email: "claire@gmail.com",
  password: 'NinjaC123@',
  tokens: [{
    token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
  }]
}

const taskOne = {
  _id: new mongoose.Types.ObjectId,
  description: 'First task',
  completed: false,
  owner: userOne._id
}

const taskTwo = {
  _id: new mongoose.Types.ObjectId,
  description: 'Second task',
  completed: true,
  owner: userOne._id
}

const taskThree = {
  _id: new mongoose.Types.ObjectId,
  description: 'Third task',
  completed: false,
  owner: userTwo._id
}

const setupDatabase = async () => {
  await User.deleteMany()
  await Task.deleteMany()
  await new User(userOne).save()
  await new User(userTwo).save()
  await new Task(taskOne).save()
  await new Task(taskTwo).save()
  await new Task(taskThree).save()
}

module.exports = {
  userOneId,
  userOne,
  userTwo,
  userTwoId,
  setupDatabase,
  taskOne,
  taskTwo,
  taskThree
}
