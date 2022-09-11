const express = require('express')
const auctionController = require('../controllers/auctionController')
const authController = require('../controllers/authController')

const router = express.Router({ mergeParams: true })

router
    .route('/')
    .get(auctionController.getProductAndUserIds, auctionController.getAllBiddings)
    .post(authController.protect, auctionController.getUserToBid, auctionController.createBidding)
router
    .route('/:id')
    .get(auctionController.getBidding)
    .patch(authController.protect, authController.restrictTo('admin'), auctionController.updateBidding)
    .delete(authController.protect, authController.restrictTo('admin'), auctionController.deleteBidding)

module.exports = router
