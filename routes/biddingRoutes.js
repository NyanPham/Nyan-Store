const express = require('express')
const biddingController = require('../controllers/biddingController')
const authController = require('../controllers/authController')

const router = express.Router({ mergeParams: true })

router
    .route('/')
    .get(biddingController.getProductAndUserIds, biddingController.getAllBiddings)
    .post(authController.protect, biddingController.createBidding)
router
    .route('/:id')
    .get(biddingController.getBidding)
    .patch(authController.protect, authController.restrictTo('admin'), biddingController.updateBidding)
    .delete(authController.protect, authController.restrictTo('admin'), biddingController.deleteBidding)

module.exports = router
