const mongoose = require('mongoose')

const slugify = require('../utils/slugify')

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A product must have a name'],
        },
        vendor: {
            type: String,
            default: 'Unknown',
        },
        images: [String],
        description: String,
        summary: {
            type: String,
            required: [true, 'A product must have a summary'],
        },
        variants: [
            {
                name: {
                    type: String,
                    required: [true, 'A variant must have a name'],
                },
                option1: String,
                option2: String,
                option3: String,
                images: [String],
                price: {
                    type: Number,
                    required: [true, 'A variant must have a price'],
                },
                oldPrice: Number,
                inventory: {
                    type: Number,
                    required: [true, 'A variant must have a number in inventory'],
                    min: [0, 'A variant cannot have negative number in inventory'],
                },
            },
        ],
        SKU: {
            type: String,
            required: [true, 'A product must have an SKU'],
        },
        slug: String,
        categories: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Category',
            },
        ],
        collections: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Collection',
            },
        ],
        tags: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        inventory: Number,
        bidding: {
            onBidding: {
                type: Boolean,
                default: false,
            },
            biddingExpiresIn: Date,
        },
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
)

productSchema.pre('save', function (next) {
    this.slug = slugify(this.name)

    next()
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product
