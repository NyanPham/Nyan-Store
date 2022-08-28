const Bidding = require('../models/BiddingModel')
const factory = require('./factoryHandler')

exports.getProductAndUserIds = (req, res, next) => {
    if (req.user) req.body.user = req.user.id
    if (req.params.productId) req.body.product = req.params.productId

    next()
}

exports.getAllBiddings = factory.getAll(Bidding)
exports.createBidding = factory.createOne(Bidding)
exports.getBidding = factory.getOne(Bidding)
exports.updateBidding = factory.updateOne(Bidding)
exports.deleteBidding = factory.deleteOne(Bidding)
