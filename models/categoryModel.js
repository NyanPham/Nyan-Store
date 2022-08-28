const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A category must have a name'],
        unique: true,
    },
    description: String,
    summary: {
        type: String,
        required: [true, 'A category must have a summary'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
})

const Category = mongoose.model('Category', categorySchema)

module.exports = Category