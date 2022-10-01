const factory = require('./factoryHandler')
const Bidding = require('../models/auctionModel')
const User = require('../models/userModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

exports.getProductAndUserIds = (req, res, next) => {
    if (req.params.productId) req.body.product = req.params.productId
    if (req.params.userId) req.body.user = req.params.userId

    const parsedUrl = req.originalUrl.split('/')

    if (parsedUrl[parsedUrl.length - 1].startsWith('my') && req.user != null) {
        req.body.user = req.user._id
    }

    next()
}

exports.getUserToBid = (req, res, next) => {
    if (req.user) req.body.user = req.user._id

    console.log('loggedin user: ', req.user)
    console.log('user in body data: ', req.body.user)

    next()
}

// exports.setAuctionWinner = catchAsync(async (req, res, next) => {
//     const user = await User.findOne({ email: req.body.winner })

//     if (user == null) {
//         return next(new AppError('No user found. Please try again later', 400))
//     }

//     if (user.wonBidProducts.)

//     user.wonBidProducts = [
//         ...user.wonBidProducts,
//         { product: req.body.product, variant: req.body.variant, bidPrice: req.body.bidPrice },
//     ]

//     await user.save()

//     res.status(200).json({
//         status: 'success',
//         data: {
//             wonBidProducts: user.wonBidProducts,
//         },
//     })
// })

exports.getAllBiddings = factory.getAll(Bidding)
exports.createBidding = factory.createOne(Bidding)
exports.getBidding = factory.getOne(Bidding)
exports.updateBidding = factory.updateOne(Bidding)
exports.deleteBidding = factory.deleteOne(Bidding)
