const expect = require('expect')
const request = require('supertest')
const { ObjectId } = require('mongodb')

const Todo = require('../../models/todos')

beforeEach(async () => {
  await Todo.deleteMany()
  const todo = new Todo({
    title: 'todo1',
    creator: new ObjectId()
  })
})