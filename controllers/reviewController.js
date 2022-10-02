const Review = require('../models/reviewModel')
const factory = require('../controllers/factoryHandler')

exports.setUserId = (req, res, next) => {
    if (req.user) req.body.user = req.user._id

    next()
}

exports.getAllReviews = factory.getAll(Review)
exports.createReview = factory.createOne(Review)
exports.getReview = factory.getOne(Review, { path: 'user' })
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)
