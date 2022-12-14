const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
    {
        total: {
            type: Number,
            required: [true, 'An order must have a total'],
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                variant: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'Variant',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: [1, 'An item in order must at least 1'],
                },
            },
        ],
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'An order must be made by a user'],
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

orderSchema.index({
    createdAt: -1,
})

orderSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'items',
        populate: {
            path: 'variant',
        },
    })

    next()
})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order
