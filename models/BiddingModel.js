const mongoose = require('mongoose')

const biddingSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
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
    },
})

const Bidding = mongoose.model('Bidding', biddingSchema)

module.exports = Bidding
