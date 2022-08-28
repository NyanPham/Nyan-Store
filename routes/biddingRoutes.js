const express = require('express')
const biddingController = require('../controllers/biddingController')
const authController = require('../controllers/authController')

const router = express.Router({ mergeParams: true })

router
    .route('/')
    .get(authController.protect, biddingController.getProductAndUserIds, biddingController.getAllBiddings)
    .post(biddingController.createBidding)
router
    .route('/:id')
    .get(biddingController.getBidding)
    .patch(biddingController.updateBidding)
    .delete(biddingController.deleteBidding)

module.exports = router
