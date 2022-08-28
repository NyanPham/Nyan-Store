const express = require('express')
const authController = require('../controllers/authController')
const userController = require('../controllers/userController')
const biddingRouter = require('./biddingRoutes')
const orderRouter = require('./orderRoutes')

const router = express.Router()

// To bidding
router.use('/:userId/bidding', biddingRouter)
router.use('/myBidding', biddingRouter)

// To orders
router.use('/:userId/orders', orderRouter)
router.use('/myOrders', orderRouter)

// Authentication
router.post('/signUp', authController.signUp)
router.post('/logIn', authController.logIn)
router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:resetToken', authController.resetPassword)
router.patch('/updatePassword', authController.protect, authController.updatePassword)

// Me Routes
router.get('/me', authController.protect, userController.getMe, userController.getUser)
router.patch('/updateMe', authController.protect, userController.updateMe)
router.delete('/deleteMe', authController.protect, userController.deleteMe)

// User data routes
router.route('/').get(userController.getAllUsers)
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser)

module.exports = router
