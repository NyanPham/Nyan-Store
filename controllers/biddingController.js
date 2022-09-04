const factory = require('./factoryHandler')
// const Bidding = require('../models/biddingModel')

exports.getProductAndUserIds = (req, res, next) => {
    if (req.params.productId) req.body.product = req.params.productId
    if (req.params.userId) req.body.user = req.params.userId

    const parsedUrl = req.originalUrl.split('/')

    if (parsedUrl[parsedUrl.length - 1].startsWith('my')) {
        req.body.user = req.user._id
    }

    next()
}

exports.getUserToBid = (req, res, next) => {
    if (req.user) req.body.user = req.user._id
    next()
}

exports.getAllBiddings = factory.getAll(Bidding)
exports.createBidding = factory.createOne(Bidding)
exports.getBidding = factory.getOne(Bidding)
exports.updateBidding = factory.updateOne(Bidding)
exports.deleteBidding = factory.deleteOne(Bidding)
