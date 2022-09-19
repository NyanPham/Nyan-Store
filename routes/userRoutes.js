const express = require('express')
const authController = require('../controllers/authController')
const userController = require('../controllers/userController')
const wishlistController = require('../controllers/wishlistController')
const cartController = require('../controllers/cartController')
const auctionRouter = require('./auctionRoutes')
const orderRouter = require('./orderRoutes')

const router = express.Router()

// Authentication
router.post('/signUp', authController.signUp)
router.post('/logIn', authController.logIn)
router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:resetToken', authController.resetPassword)
router.get('/isLoggedIn', authController.isLoggedIn)

// To bidding
router.use('/:userId/biddings', auctionRouter)
router.use('/myBiddings', auctionRouter)

// To orders
router.use('/:userId/orders', orderRouter)
router.use('/myOrders', orderRouter)

// On client
router.use(authController.protect)

router
    .route('/myWishlist')
    .get(wishlistController.getWishlist)
    .patch(wishlistController.addWishlist)

router.route('/removeWishlist').patch(wishlistController.removeWishlist)

router.patch('/updatePassword', authController.updatePassword)
router.get('/logOut', authController.logOut)

// Me Routes
router.get('/me', userController.getMe, userController.getUser)
router.patch(
    '/updateMe',
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
)
router.delete('/deleteMe', userController.deleteMe)
router.patch('/addToMyCart', cartController.addToMyCart)
router.get('/getMyCart', cartController.getMyCart)
router.patch('/updateMyCart', cartController.updateMyCart)
router.patch('/removeMyCart', cartController.removeMyCart)
router.route('/myNote').get(userController.getOrderNote).patch(userController.updateOrderNote)

// User data routes
router.use(authController.restrictTo('admin'))
router.route('/').get(userController.getAllUsers)
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

module.exports = router
