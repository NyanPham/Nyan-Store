const express = require('express')
const productController = require('../controllers/productController')
const authController = require('../controllers/authController')
const biddingRouter = require('./biddingRoutes')

const router = express.Router({ mergeParams: true })

router.use('/:productId/bidding', biddingRouter)

router.get('/filterFacets', productController.getFilterFacets)
router.post('/filter', productController.filterProducts)
router.get('/slug/:slug', productController.getProductFromSlug)

router
    .route('/')
    .get(productController.getCollectionAndCategoryIds, productController.getAllProducts)
    .post(authController.protect, authController.restrictTo('admin'), productController.createProducts)
router
    .route('/:id')
    .get(productController.getProduct)
    .patch(authController.protect, authController.restrictTo('admin'), productController.updateProduct)
    .delete(authController.protect, authController.restrictTo('admin'), productController.deleteProduct)

module.exports = router
