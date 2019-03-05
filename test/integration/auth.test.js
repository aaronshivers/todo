// const request = require('supertest')
// const app = require('../../app')
// const User = require('../../models/users')
// const Todo = require('../../models/todos')

// describe('auth middleware', () => {

//   let token

//   const exec = () => {
//     return request(app)
//       .post('/todos')
//       .set('x-auth-token', token)
//       .send({ title: 'todo1' })
//   }

//   beforeEach(async () => {
//     Todo.deleteMany()
//     token = new User().createAuthToken()
//   })


//   it('should return 401 if no token is provided', async () => {
//     token = ''

//     await exec().expect(401)
//   })

//   it('should return 400 if token is invalid', async () => {
//     token = 'sadf'

//     await exec().expect(400)
//   })

//   it('should return 200 if token is valid', async () => {
//     await exec().expect(200)
//   })
// })