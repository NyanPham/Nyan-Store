const express = require('express')
const productController = require('../controllers/productController')
const authController = require('../controllers/authController')
const biddingRouter = require('./biddingRoutes')

const router = express.Router({ mergeParams: true })

router.use('/:productId/bidding', biddingRouter)

router
    .route('/')
    .get(
        authController.protect,
        authController.restrictTo('admin'),
        productController.getCollectionAndCategoryIds,
        productController.getAllProducts
    )
    .post(productController.createProducts)
router
    .route('/:id')
    .get(productController.getProduct)
    .patch(productController.updateProduct)
    .delete(productController.deleteProduct)

module.exports = router
