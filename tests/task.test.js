const request = require('supertest')
const app = require('../app')
const Task = require('../models/taskModel')
const {
  userOneId,
  userOne,
  userTwo,
  userTwoId,
  setupDatabase,
  taskOne,
  taskTwo,
  taskThree
} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'From my test'
    })
    .expect(201)
  const task = await Task.findById(response.body.task._id)
  expect(task).not.toBeNull()
  expect(task.completed).toEqual(false)
})

test('Should get all tasks for a user', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
  expect(response.body.length).toEqual(2)
})

test('Should not delete other users tasks', async () => {
  const response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)
  const task = await Task.findById(taskOne._id)
  expect(task).not.toBeNull()
})
