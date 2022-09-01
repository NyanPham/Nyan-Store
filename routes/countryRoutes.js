const express = require('express')
const countryController = require('../controllers/countryController')

const router = express.Router()
router.get('/', countryController.getCountries)

module.exports = router
