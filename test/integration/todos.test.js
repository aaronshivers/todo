const expect = require('expect')
const request = require('supertest')
const { ObjectId } = require('mongodb')

const app = require('../../app')
const Todo = require('../../models/todos')
const { User } = require('../../models/users')

let token
let todos = []

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

  todos = [{
    _id: new ObjectId(),
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

  describe('GET /todos', () => {

    it('should respond 401 if user is NOT logged in', async () => {

      await request(app)
        .get('/todos')
        .expect(401)
    })

    it('should display an empty table if no todos are found', async () => {
      await Todo.deleteMany()

      const cookie = `token=${ token }`

      await request(app)
        .get('/todos')
        .set('Cookie', cookie)
        .expect(200)
        .expect(res => {
          expect(res.text).not.toContain('todo0')
          expect(res.text).not.toContain('todo1')
        })
    })

    it('should respond 200 and get todos if user is logged in, and is creator', async () => {

      const cookie = `token=${ token }`
      
      await request(app)
        .get('/todos')
        .set('Cookie', cookie)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('todo0')
          expect(res.text).not.toContain('todo1')
        })
    })
  })

  describe('POST /todos', () => {
    it('should respond 401 if user is NOT logged in', async () => {
      await request(app)
        .post('/todos')
        .expect(401)
    })

    it('should respond 400 if data is invalid', async () => {
      const todo = { title: 1234 }
      const cookie = `token=${ token }`

      await request(app)
        .post('/todos')
        .set('Cookie', cookie)
        .send(todo)
        .expect(400)

      const foundTodo = await Todo.findOne(todo)
      expect(foundTodo).toBeFalsy()
    })

    it('should respond 302 create the todo and redirect to /todos', async () => {
      const cookie = `token=${ token }`
      const todo = { title: 'hello' }

      await request(app)
        .post('/todos')
        .set('Cookie', cookie)
        .send(todo)
        .expect(302)
        .expect(res => {
          expect(res.header.location).toEqual('/todos')
        })
      
      const foundTodo = await Todo.findOne(todo)
      expect(foundTodo).toBeTruthy()
    })
  })

  describe('GET /todos/:id/edit', () => {

    it('should respond 401 if user is NOT logged in', async () => {

      await request(app)
        .get(`/todos/${ todos[0]._id }/edit`)
        .expect(401)
    })

    it('should respond 400 if id is invalid', async () => {
      const cookie = `token=${ token }`

      await request(app)
        .get(`/todos/1234/edit`)
        .set('Cookie', cookie)
        .expect(400)
    })

    it('should respond 404 if id is NOT in the DB, or user is NOT the creator', async () => {
      const cookie = `token=${ token }`

      await request(app)
        .get(`/todos/${ new ObjectId() }/edit`)
        .set('Cookie', cookie)
        .expect(404)
    })

    it('should respond 200 and display the todo', async () => {
      const cookie = `token=${ token }`

      await request(app)
        .get(`/todos/${ todos[0]._id }/edit`)
        .set('Cookie', cookie)
        .expect(200)
    })
  })

  describe('PATCH /todos/:id', () => {
    it('should respond 401 if user is NOT logged in', async () => {})
    it('should respond 404 if id is in the DB', async () => {})
    it('should respond 401 if user is NOT creator', async () => {})
    it('should respond 302 update the todo and redirect to /todos', async () => {})
  })
  
  describe('DELETE /todos/:id', () => {
    it('should respond 401 if user is NOT logged in', async () => {})
    it('should respond 404 if id is in the DB', async () => {})
    it('should respond 401 if user is NOT creator', async () => {})
    it('should respond 302 delete the todo and redirect to /todos', async () => {})
  })
})