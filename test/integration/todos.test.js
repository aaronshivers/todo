const expect = require('expect')
const request = require('supertest')
const { ObjectId } = require('mongodb')

const app = require('../../app')
const Todo = require('../../models/todos')
const User = require('../../models/users')

beforeEach(async () => {
  await Todo.deleteMany()

  const todos = [{
    title: 'todo0',
    creator: new ObjectId()
  }, {
    title: 'todo1',
    creator: new ObjectId()
  }]

  await new Todo(todos[0]).save()
  await new Todo(todos[1]).save()
})

describe('/todos', () => {

  describe('GET /todos', () => {
    it('should respond 401 if user is NOT logged in', async () => {
      await request(app)
        .get('/todos')
        .expect(401)
    })

    it('should respond 200 and get todos if user is logged in', async () => {
      const token = new User().createAuthToken()

      await request(app)
        .get('/todos')
        .set('x-auth-token', token)
        .expect(200)
    })
  })
})