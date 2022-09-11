const mongoose = require('mongoose')

const biddingSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true,
    },
    variant: {
        type: mongoose.Schema.ObjectId,
        required: true,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    duesIn: {
        type: Date,
        required: [true, 'A bidding session must have an expire time'],
    },
    price: {
        type: Number,
        default: 0,
        min: [0],
    },
})

biddingSchema.index({
    createdAt: -1,
})

biddingSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'email',
    })

    next()
})

const Bidding = mongoose.model('Bidding', biddingSchema)

module.exports = Bidding
