const express =  require('express')
const router = express.Router()

// GET /
router.get('/', (req, res) => res.render('home'))

// GET /
router.get('/offline', (req, res) => res.render('offline'))

module.exports = router
