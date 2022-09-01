const crypto = require('crypto')
const bcrypt = require('bcrypt')
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
            minlength: [8, 'A password must be at least 8 in length'],
            select: false,
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
                product: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'Product',
                    required: [true, 'A cart item must have a product ID'],
                },
                variant: {
                    type: Object,
                    required: true,
                },
                option1: String,
                option2: String,
                option3: String,
                quantity: {
                    type: Number,
                    required: [true, 'A cart item must have a quantity'],
                    min: [1, 'An item must have at least 1 unit in cart'],
                },
                addedAt: {
                    type: Date,
                    default: Date.now(),
                },
                updatedAt: Date,
            },
        ],
        orderNote: String,
        appliedCoupons: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Coupon',
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
            default: 'user',
        },
        wishlist: [
            {
                item: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'Product',
                    required: [true, 'A wishlist item must have an ID'],
                },
                addedAt: {
                    type: Date,
                    required: true,
                },
            },
        ],
        active: {
            type: Boolean,
            default: true,
            select: false,
        },
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
)

userSchema.index({
    email: 1,
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined

    next()
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()

    this.passwordChangedAt = new Date(Date.now() - 1000)

    next()
})

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } })

    next()
})

userSchema.methods.comparePassword = async function (candidatePassword, password) {
    return await bcrypt.compare(candidatePassword, password)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt != null) {
        const passwordChangedTimestamp = new Date(this.passwordChangedAt).getTime() / 1000
        return passwordChangedTimestamp > JWTTimestamp
    }

    return false
}

userSchema.methods.createResetToken = function () {
    const token = crypto.randomBytes(32).toString('hex')

    this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex')
    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000

    return token
}

const User = mongoose.model('User', userSchema)

module.exports = User
