const expect = require('expect')
const request = require('supertest')
const { ObjectId } = require('mongodb')

const app = require('../../app')
const { User } = require('../../models/users')
const Todo = require('../../models/todos')
const { users, populateUsers, tokens } = require('./seed')

// GET /
describe('GET /', () => {

  it('should respond with 200', async () => {
    await request(app)
      .get('/')
      .expect(200)
  })
})

describe('/users', () => {

  beforeEach(populateUsers)

  // POST /users
  describe('POST /users', () => {

    it('should create a new user', async () => {
      const { email, password } = users[2]

      await request(app)
        .post('/users')
        .send({ email, password })
        .expect(201)
        .expect((res) => {
          expect(res.text).toContain(email)
          expect(res.header).toHaveProperty('set-cookie')
          expect(res.header['set-cookie']).toBeTruthy()
        })

        const user = await User.findOne({email})
        expect(user).toBeTruthy()
        expect(user.email).toEqual(email)
        expect(user.password).not.toEqual(password)
    })

    it('should NOT create a duplicate user', async () => {
      const { email, password } = users[0]

      await request(app)
        .post('/users')
        .send({ email, password })
        .expect(400)
        .expect((res) => {
          expect(res.header['set-cookie']).toBeFalsy()
        })
    })

    it('should NOT create a user with an invalid email', async () => {
      const { email, password } = users[3]

      await request(app)
        .post('/users')
        .send({ email, password })
        .expect(400)
        .expect((res) => {
          expect(res.header['set-cookie']).toBeFalsy()
        })
    })

    it('should NOT create a user with an invalid password', async () => {
      const { email, password } = users[4]
      
      await request(app)
        .post('/users')
        .send({ email, password })
        .expect(400)
        .expect((res) => {
          expect(res.header['set-cookie']).toBeFalsy()
        })
    })
  })

  // GET /users
  describe('GET /users', () => {

    it('should respond 401 if user is NOT admin', async () => {
      const cookie = `token=${tokens[1]}`

      await request(app)
        .get('/users')
        .set('Cookie', cookie)
        .expect(401)
    })

    it('should get all users if user is admin', async () => {
      const cookie = `token=${tokens[0]}`

      await request(app)
        .get('/users')
        .set('Cookie', cookie)
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain(users[0].email)
          expect(res.text).toContain(users[1].email)
        })
    })
  })

  // GET /users/:id
  describe('GET /users/:id/view', () => {

    it('should respond 401, if user is NOT logged in', async () => {
      await request(app)
        .get(`/users/${ users[0]._id }/view`)
        .expect(401)
    })

    it('should respond 401, if user is NOT an admin', async () => {
      const cookie = `token=${tokens[1]}`

      await request(app)
        .get(`/users/${ users[3]._id }/view`)
        .set('Cookie', cookie)
        .expect(401)
    })

    it('should respond 400, if Id is invalid', async () => {
      const cookie = `token=${tokens[0]}`

      await request(app)
        .get(`/users/1234/view`)
        .set('Cookie', cookie)
        .expect(400)
    })

    it('should get the specified user', async () => {
      const { _id, email, password } = users[0]
      const cookie = `token=${tokens[0]}`

      await request(app)
        .get(`/users/${ _id }/view`)
        .set('Cookie', cookie)
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain(_id.toString())
          expect(res.text).toContain(email)
        })
    })

    it('should return 404 if user not found', async () => {
      const { _id } = users[2]
      const cookie = `token=${tokens[0]}`

      request(app)
        .get(`/users/${ _id }`)
        .set('Cookie', cookie)
        .expect(404)
    })
  })

  // GET /users/:id/edit
  describe('GET /users/:id/edit', () => {
    
    it('should respond 401, if user is NOT logged in', async () => {
      await request(app)
        .get(`/users/${ users[0]._id }/edit`)
        .expect(401)
    })

    it('should respond 401, if user is NOT an admin', async () => {
      const cookie = `token=${tokens[1]}`

      await request(app)
        .get(`/users/${ users[3]._id }/edit`)
        .set('Cookie', cookie)
        .expect(401)
    })

    it('should respond 400, if Id is invalid', async () => {
      const cookie = `token=${tokens[1]}`

      await request(app)
        .get(`/users/1234/edit`)
        .set('Cookie', cookie)
        .expect(400)
    })

    it('should respond 200, if user is account owner', async () => {
      const cookie = `token=${tokens[1]}`

      await request(app)
        .get(`/users/${ users[1]._id }/edit`)
        .set('Cookie', cookie)
        .expect(200)
    })

    it('should respond 200, if user is admin', async () => {
      const cookie = `token=${tokens[0]}`

      await request(app)
        .get(`/users/${ users[1]._id }/edit`)
        .set('Cookie', cookie)
        .expect(200)
    })
  })

  // DELETE /users/:id
  describe('DELETE /users/:id', () => {

    beforeEach(async() => {
      await Todo.deleteMany({ creator: users[0]._id })
      await new Todo({ title: 'todo', creator: users[0]._id }).save()
    })

    it('should respond 401 if user is NOT logged in', async () => {

      await request(app)
        .get('/users')
        .expect(401)

      const todos = await Todo.find({ creator: users[0]._id })
      expect(todos.length).toBe(1)
    })

    it('should return 400 if Id is invalid', async () => {

      const cookie = `token=${tokens[0]}`

      request(app)
        .delete(`/users/1234`)
        .set('Cookie', cookie)
        .expect(400)
      
      const todos = await Todo.find({ creator: users[0]._id })
      expect(todos.length).toBe(1)
    })

    it('should return 404 if the specified user is not found', async () => {

      const cookie = `token=${tokens[0]}`

      request(app)
        .delete(`/users/${ new ObjectId() }`)
        .set('Cookie', cookie)
        .expect(404)

      const todos = await Todo.find({ creator: users[0]._id })
      expect(todos.length).toBe(1)
    })

    it('should delete the user, cookie, and todos, then redirect to /', async () => {

      const { _id } = users[0]
      const cookie = `token=${tokens[0]}`

      await request(app)
        .delete(`/users/${ _id }`)
        .set('Cookie', cookie)
        .expect(302)
        .expect((res) => {
          expect(res.header.location).toEqual('/')
          expect(res.header['set-cookie'])
            .toEqual(["token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"])
        })

      const user = await User.findById(_id)
      expect(user).toBeFalsy()

      const todos = await Todo.find({ creator: users[0]._id })
      expect(todos.length).toBe(0)
    })
  })

  // PATCH /users
  describe('PATCH /users/:id', () => {

    it('should respond 401 if user is not logged in', async () => {
      const { _id } = users[0]

      await request(app)
        .patch(`/users/${ _id }`)
        .expect(401)
    })

    it('should respond 404 if ObjectId is not in DB', async () => {
      const { _id } = new ObjectId()
      const cookie = `token=${tokens[0]}`
      const { email, password } = users[2]

      await request(app)
        .patch(`/users/${ _id }`)
        .set('Cookie', cookie)
        .send({ email, password })
        .expect(404)
    })

    it('should respond 302, save the updated user, and redirect to /users/profile if user is account owner', async () => {
      const { _id } = users[1]
      const { email, password } = users[2]
      const cookie = `token=${tokens[1]}`

      await request(app)
        .patch(`/users/${ _id }`)
        .set('Cookie', cookie)
        .send({ email, password })
        .expect(302)
        .expect(res => {
          expect(res.header.location).toEqual('/users/profile')
        })

        const user = await User.findById(_id)
        expect(user).toBeTruthy()
        expect(user._id).toEqual(_id)
        expect(user.email).toEqual(email)
        expect(user.password).not.toEqual(password)
    })

    it('should respond 401, NOT update user if user is NOT account owner, or NOT Admin', async () => {
      const { _id } = users[0]
      const { email, password } = users[2]
      const cookie = `token=${tokens[1]}`

      await request(app)
        .patch(`/users/${ _id }`)
        .set('Cookie', cookie)
        .send({ email, password })
        .expect(401)

        const user = await User.findById(_id)
        expect(user).toBeTruthy()
        expect(user._id).toEqual(_id)
        expect(user.email).toEqual(users[0].email)
    })

    it('should respond 302, save the updated user, and redirect to /users/profile if user is Admin', async () => {
      const { _id } = users[1]
      const { email, password } = users[2]
      const cookie = `token=${tokens[0]}`

      await request(app)
        .patch(`/users/${ _id }`)
        .set('Cookie', cookie)
        .send({ email, password })
        .expect(302)
        .expect(res => {
          expect(res.header.location).toEqual('/users/profile')
        })

        const user = await User.findById(_id)
        expect(user).toBeTruthy()
        expect(user._id).toEqual(_id)
        expect(user.email).toEqual(email)
        expect(user.password).not.toEqual(password)
    })

    it('should NOT create a duplicate user', async () => {
      const { _id } = users[0]
      const { email, password } = users[1]
      const cookie = `token=${tokens[0]}`

      await request(app)
        .patch(`/users/${ _id }`)
        .set('Cookie', cookie)
        .send({ email, password })
        .expect(400)

        const user = await User.findById(_id)
        expect(user._id).toEqual(_id)
        expect(user.email).not.toEqual(email)
    })

    it('should NOT update a user with an invalid email', async () => {
      const { _id } = users[0]
      const cookie = `token=${tokens[0]}`
      const update = { email: 'invalid!email*com', password: users[0].password }
      
      await request(app)
        .patch(`/users/${ _id }`)
        .set('Cookie', cookie)
        .send(update)
        .expect(400)

      const user = await User.findById(_id)
      expect(user._id).toEqual(_id)
      expect(user.email).not.toEqual(update.email)
    })

    it('should NOT update a user with an invalid password', async () => {
      const { _id } = users[0]
      const cookie = `token=${tokens[0]}`

      await request(app)
        .patch(`/users/${ _id }`)
        .set('Cookie', cookie)
        .send({ email: users[0].email, password: 'invalidpass' })
        .expect(400)
    })
  })

  // GET /users/profile
  describe('GET /users/profile', () => {
    it('should respond with 200 if user is logged in', async () => {
      const cookie = `token=${tokens[0]}`
      await request(app)
        .get('/users/profile')
        .set('Cookie', cookie)
        .expect(200)
    })

    it('should respond with 401 if user is NOT logged in', async () => {
      await request(app)
        .get('/users/profile')
        .expect(401)
    })

    it('should respond with 400 if token is phony', async () => {
      const cookie = `token=${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'}`
      await request(app)
        .get('/users/profile')
        .set('Cookie', cookie)
        .expect(400)
    })
  })

  describe('POST /login', () => {
    it('should login user and create a token', async () => {
      const { email, password } = users[0]
      await request(app)
        .post('/login')
        .send({ email, password })
        .expect(302)
        .expect((res) => {
          expect(res.header.location).toEqual('/users/profile')
          expect(res.header['set-cookie']).toBeTruthy()
        })
    })

    it('should NOT login user if email is not in the database', async () => {
      const { email, password } = users[2]
      await request(app)
        .post('/login')
        .send({ email, password })
        .expect(404)
        .expect((res) => {
          expect(res.text).not.toContain(email)
          expect(res.header['set-cookie']).toBeFalsy()
        })
    })

    it('should NOT login user if password is incorrect', async () => {
      const { email } = users[0]
      const { password } = users[2]
      request(app)
        .post('/login')
        .send({ email, password })
        .expect(401)
        .expect((res) => {
          expect(res.text).not.toContain(email)
          expect(res.header['set-cookie']).toBeFalsy()
        })
    })
  })

  // GET /admin
  describe('GET /admin', () => {
    it('should respond 200 if user is admin', async () => {
      const cookie = `token=${tokens[0]}`

      await request(app)
        .get('/admin')
        .set('Cookie', cookie)
        .expect(200)
    })

    it('should respond 401 if user is NOT admin', async () => {
      const cookie = `token=${tokens[1]}`

      await request(app)
        .get('/admin')
        .set('Cookie', cookie)
        .expect(401)
    })

    it('should respond 401 if user is NOT logged in', async () => {
      request(app)
        .get('/admin')
        .expect(401)
    })
  })

  // GET /logout
  describe('GET /logout', () => {
    it('should logout user delete auth token, and redirect to /', async () => {
      const cookie = `token=${tokens[0]}`
      await request(app)
        .get('/logout')
        .set('Cookie', cookie)
        .expect(302)
        .expect((res) => {
          expect(res.header.location).toEqual('/')
          expect(res.header['set-cookie']).toEqual(["token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"])
        })
    })
  })
})
