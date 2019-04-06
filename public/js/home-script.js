const homeContainer = document.getElementById('homeContainer')
const loginLink = document.getElementsByClassName('loginLink')

document.cookie ? null : homeContainer.innerHTML += `<a class="btn btn-outline-primary btn-lg btn-block mt-3" href="/login">Login</a>`
document.cookie ? null : homeContainer.innerHTML += `<a class="btn btn-outline-primary btn-lg btn-block mt-3" href="/signup">Signup</a>`
document.cookie ? homeContainer.innerHTML += `<a class="btn btn-outline-primary btn-lg btn-block mt-3" href="/todos">Todos</a>` : null
document.cookie ? homeContainer.innerHTML += `<a class="btn btn-outline-primary btn-lg btn-block mt-3" href="/users/profile">Profile</a>` : null
document.cookie ? homeContainer.innerHTML += `<a class="btn btn-outline-primary btn-lg btn-block mt-3" href="/logout">Logout</a>` : null
