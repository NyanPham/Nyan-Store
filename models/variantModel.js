const mongoose = require('mongoose')
const slugify = require('../utils/slugify')

const variantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A variant must have a name'],
        unique: true,
    },
    slug: String,
    option1: String,
    option2: String,
    option3: String,
    images: [String],
    price: {
        type: Number,
        required: [true, 'A variant must have a price'],
    },
    comparePrice: {
        type: Number,
        validate: {
            validator: function (priceToCompare) {
                if (!this.price) return true
                return priceToCompare > this.price
            },
            message: 'Compare price must be larger than price',
        },
    },
    inventory: {
        type: Number,
        required: [true, 'A variant must have the inventory number'],
    },
})

variantSchema.pre('save', function (next) {
    this.slug = slugify(this.name)

    next()
})

const Variant = mongoose.model('Variant', variantSchema)

module.exports = Variant
