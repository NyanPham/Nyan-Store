const express = require('express')
const orderController = require('../controllers/orderController')
const authController = require('../controllers/authController')

const router = express.Router({ mergeParams: true })

router
    .route('/')
    .get(authController.protect, orderController.getUserId, orderController.getAllOrders)
    .post(orderController.createOrder)
router
    .route('/:id')
    .get(orderController.getOrder)
    .patch(orderController.updateOrder)
    .delete(orderController.deleteOrder)

module.exports = router
