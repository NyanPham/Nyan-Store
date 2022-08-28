const mongoose = require('mongoose')
const Product = require('./productModel')

const collectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A collection must have a name'],
        unique: true,
    },
    description: String,
    summary: {
        type: String,
        required: [true, 'A collection must have a summary'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
})

collectionSchema.index({
    createdAt: -1,
})

collectionSchema.methods.getProducts = async function (collectionId) {
    const products = await Product.find({
        collections: {
            $elemMatch: collectionId,
        },
    })

    return products
}

const Collection = mongoose.model('Collection', collectionSchema)

module.exports = Collection
