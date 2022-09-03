const express = require('express')
const variantController = require('../controllers/variantController')

const router = express.Router()
router.route('/').get(variantController.getAllVariants).post(variantController.createVariant)
router
    .route('/:id')
    .get(variantController.getVariant)
    .patch(variantController.updateVariant)
    .delete(variantController.deleteVariant)

module.exports = router
