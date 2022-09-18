const express = require('express')
const orderController = require('../controllers/orderController')
const authController = require('../controllers/authController')

const router = express.Router({ mergeParams: true })

router.use(authController.protect)

router.post('/checkout-session', orderController.getCheckoutSession)

router
    .route('/')
    .get(orderController.getUserId, orderController.getAllOrders)
    .post(orderController.createOrder)
router
    .route('/:id')
    .get(orderController.getOrder)
    .patch(authController.restrictTo('admin'), orderController.updateOrder)
    .delete(authController.restrictTo('admin'), orderController.deleteOrder)

module.exports = router
