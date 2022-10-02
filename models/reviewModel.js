const mongoose = require('mongoose')

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

reviewSchema.index({
    user: 1,
    product: 1,
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
