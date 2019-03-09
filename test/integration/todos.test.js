const expect = require('expect')
const request = require('supertest')
const { ObjectId } = require('mongodb')

const app = require('../../app')
const Todo = require('../../models/todos')
const { User } = require('../../models/users')

let token

beforeEach(async () => {
  await User.deleteMany()
  await Todo.deleteMany()

  const userObj = {
    _id: new ObjectId(),
    email: 'user@test.com',
    password: 'asdfASDF1234!@#$'
  }

  const user = await new User(userObj).save()

  token = await user.createAuthToken()

  const todos = [{
    title: 'todo0',
    creator: user._id
  }, {
    title: 'todo1',
    creator: new ObjectId()
  }]

  await new Todo(todos[0]).save()
  await new Todo(todos[1]).save()
})

describe('/todos', () => {

  const exec = () => {
    return request(app)
      .get('/todos')
      .set('x-auth-token', token)
  }

  describe('GET /todos', () => {
    it('should respond 401 if user is NOT logged in', async () => {
      token = ''

      await exec().expect(401)
    })

    it('should display an empty table if no todos are found', async () => {
      await Todo.deleteMany()

      await exec()
        .expect(200)
        .expect(res => {
          expect(res.text).not.toContain('todo0')
          expect(res.text).not.toContain('todo1')
        })
    })

    it('should respond 200 and get todos if user is logged in, and is creator', async () => {

      await exec()
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('todo0')
          expect(res.text).not.toContain('todo1')
        })
    })
  })
})