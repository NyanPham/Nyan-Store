const express = require('express')
const collectionController = require('../controllers/collectionController')
const productRouter = require('./productRoutes')

const router = express.Router()

router.use('/:collectionId/products', productRouter)

router.route('/').get(collectionController.getAllCollections).post(collectionController.createCollection)
router
    .route('/:id')
    .get(collectionController.getCollection)
    .patch(collectionController.updateCollection)
    .delete(collectionController.deleteCollection)

module.exports = router
