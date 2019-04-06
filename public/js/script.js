// service worker checker
if ('serviceWorker' in navigator) {
  navigator
    .serviceWorker
    .register('/sw.js')
    .then(() => console.log(`Service Worker Registered!`))
    .catch(err => console.log(err.message))
}

// navigation link updates
const navLinks = document.getElementById('navLinks')

document.cookie ? null : navLinks.innerHTML += `<li class="nav-item"><a class="nav-link" href="/login">Login</a></li>`
document.cookie ? null : navLinks.innerHTML += `<li class="nav-item"><a class="nav-link" href="/signup">Signup</a></li>`
document.cookie ? navLinks.innerHTML += `<li class="nav-item"><a class="nav-link" href="/todos">Todos</a></li>` : null
document.cookie ? navLinks.innerHTML += `<li class="nav-item"><a class="nav-link" href="/admin">Admin</a></li>` : null
document.cookie ? navLinks.innerHTML += `<li class="nav-item"><a class="nav-link" href="/users/profile">Profile</a></li>` : null
document.cookie ? navLinks.innerHTML += `<li class="nav-item"><a class="nav-link" href="/logout">Logout</a></li>` : null
