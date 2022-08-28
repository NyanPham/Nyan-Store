const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A user must have a name'],
        },
        email: {
            type: String,
            required: [true, 'A user must have an email'],
            unique: [true, 'An email must be unique to a user'],
        },
        password: {
            type: String,
            required: [true, 'A user must have a password'],
        },
        passwordConfirm: {
            type: String,
            validate: {
                validator: function (passwordConfirmStr) {
                    return this.password === passwordConfirmStr
                },
                message: 'Passwords do not match',
            },
        },
        photo: {
            type: String,
            default: 'default.jpeg',
        },
        cart: [
            {
                productId: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'Product',
                    required: [true, 'A cart item must have a product ID'],
                },
                option1: String,
                option2: String,
                option3: String,
                quantity: {
                    type: Number,
                    required: [true, 'A cart item must have a quantity'],
                    min: [1, 'An item must have at least 1 unit in cart'],
                },
            },
        ],
        orders: Array,
        passwordChangedAt: Date,
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        address: String,
        phone: Number,
        role: {
            type: String,
            enum: {
                values: ['user', 'admin'],
                message: 'A user must be either normal user or admin',
            },
        },
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
)

const User = mongoose.model('User', userSchema)

module.exports = User
