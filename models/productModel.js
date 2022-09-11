const mongoose = require('mongoose')
const slugify = require('../utils/slugify')

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A product must have a name'],
            unique: [true, 'A product name must be unique'],
        },
        vendor: {
            type: String,
            default: 'Unknown',
        },
        price: Number,
        images: [String],
        description: String,
        summary: {
            type: String,
            required: [true, 'A product must have a summary'],
        },
        variants: {
            type: [
                {
                    type: mongoose.Schema.ObjectId,
                    ref: 'Variant',
                },
            ],
            validate: {
                validator: function (variantsArray) {
                    return Array.isArray(variantsArray) && variantsArray.length > 0
                },
                messsage: 'Variants must be an array and has at least 1 item',
            },
        },
        minPrice: Number,
        maxPrice: Number,
        SKU: {
            type: String,
            required: [true, 'A product must have an SKU'],
            unique: [true, 'A product SKU must be unique'],
        },
        slug: String,
        category: {
            type: mongoose.Schema.ObjectId,
            ref: 'Category',
        },
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
        isAuctioned: {
            type: Boolean,
            default: false,
            validate: {
                validator: function () {
                    return this.auctionExpiresIn !== null
                },
                message: 'Auctioned product must have an expire date.',
            },
        },
        auctionExpiresIn: Date,
        reviews: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Review',
            },
        ],
        ratingsAverage: {
            type: Number,
            default: 4.5,
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
)

productSchema.index({
    name: 1,
    createdAt: -1,
    price: -1,
})

productSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'category',
    }).populate({
        path: 'variants',
    })

    next()
})

productSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'category',
    }).populate({
        path: 'variants',
    })

    next()
})

productSchema.pre('save', function (next) {
    this.slug = slugify(this.name)

    next()
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product
