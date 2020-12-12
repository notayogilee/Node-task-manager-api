const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../app')
const User = require('../models/userModel')
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

beforeEach(async () => {
  await User.deleteMany()
  await new User(userOne).save()
})

test('Should sign up a new user', async () => {
  const response = await request(app).post('/users').send({
    name: "Lee",
    email: "leek@gmail.com",
    password: 'MyPass777!'
  }).expect(201)

  // Assert that the database was changed correctly
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  // Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: 'Lee',
      email: 'leek@gmail.com'
    },
    token: user.tokens[0].token
  })
  expect(user.password).not.toBe('MyPass777!')
})

test('should log in existing user', async () => {
  const response = await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(200)

  const user = await User.findById(userOneId)

  expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistant user', async () => {
  await request(app).post('/users/login').send({
    email: userOne.email,
    password: 'MyPass7!'
  }).expect(400)
})

test('Should get profile for logged in user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
  const user = await User.findById(userOneId)
  expect(user).toBeNull()
})

test('Should not delete unauthenticated user account', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})