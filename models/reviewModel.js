const mongoose = require('mongoose')
const Product = require('./productModel')

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A review must have a user'],
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'A review must have a product'],
    },
    review: String,
    rating: {
        type: Number,
        min: [1, 'A rating must be at least 1'],
        max: [5, 'A rating must be at most 5'],
        require: [true, 'A review must have a rating'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
})

reviewSchema.index(
    {
        user: 1,
        product: 1,
    },
    {
        unique: true,
    }
)

reviewSchema.statics.updateRatingStatus = async function (productId) {
    try {
        const ratingStats = await this.aggregate([
            {
                $match: {
                    product: productId,
                },
            },
            {
                $group: {
                    _id: '$product',
                    avgRatings: { $avg: '$rating' },
                    sumRatings: { $sum: 1 },
                },
            },
        ])

        if (ratingStats[0] !== null) {
            await Product.findByIdAndUpdate(productId, {
                ratingsAverage: ratingStats[0].avgRatings,
                ratingsQuantity: ratingStats[0].sumRatings,
            })
        } else {
            await Product.findByIdAndUpdate(productId, {
                ratingsAverage: 0,
                ratingsQuantity: 0,
            })
        }
    } catch (err) {
        console.log(err.message)
    }
}

reviewSchema.post('save', function () {
    this.constructor.updateRatingStatus(this.product)
})

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.clone().findOne({})
    next()
})

reviewSchema.post(/^findOneAnd/, async function () {
    await this.r.constructor.updateRatingStatus(this.r.product)
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
