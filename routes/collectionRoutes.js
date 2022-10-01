const express = require('express')
const collectionController = require('../controllers/collectionController')
const authController = require('../controllers/authController')
const productRouter = require('./productRoutes')

const router = express.Router()

router.use('/:collectionId/products', productRouter)

router
    .route('/')
    .get(collectionController.getAllCollections)
    .post(
        authController.protect,
        authController.restrictTo('admin'),
        collectionController.createCollection
    )
router
    .route('/:id')
    .get(collectionController.getCollection)
    .patch(
        authController.protect,
        authController.restrictTo('admin'),
        collectionController.updateCollection
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin'),
        collectionController.deleteCollection
    )

module.exports = router
