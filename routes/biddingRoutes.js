const express = require('express')
const biddingController = require('../controllers/biddingController')

const router = express.Router({ mergeParams: true })

router
    .route('/')
    .get(biddingController.getProductAndUserIds, biddingController.getAllBiddings)
    .post(biddingController.createBidding)
router
    .route('/:id')
    .get(biddingController.getBidding)
    .patch(biddingController.updateBidding)
    .delete(biddingController.deleteBidding)

module.exports = router
