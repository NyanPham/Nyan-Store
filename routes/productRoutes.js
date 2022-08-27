const express = require('express')
const productController = require('../controllers/productController')

const router = express.Router()

router.route('/').get(productController.getAllProducts).post(productController.createProducts)

module.exports = router
