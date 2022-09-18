const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.getWishlist = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id)

    if (user == null) {
        return next(new AppError('No user found with that ID', 400))
    }

    res.status(200).json({
        status: 'success',
        data: {
            wishlist: user.wishlist,
        },
    })
})

exports.addWishlist = catchAsync(async (req, res, next) => {
    if (req.body.product == null) {
        return next(new AppError('No item to add', 400))
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            wishlist: [...req.user.wishlist, { item: req.body.product, addedAt: Date.now() }],
        },
        {
            new: true,
            runValidators: true,
        }
    )

    if (user == null) {
        return next(new AppError('No user found with that ID', 400))
    }

    res.status(201).json({
        status: 'success',
        data: {
            wishlist: user.wishlist,
        },
    })
})

exports.removeWishlist = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id)

    if (user == null) {
        return next(new AppError('No user found with that ID', 400))
    }

    user.wishlist = [...user.wishlist].filter(
        (item) => item.item._id.toString() !== req.body.product
    )
    await user.save({ validateBeforeSave: true })

    res.status(200).json({
        status: 'success',
        data: {
            wishlist: user.wishlist,
        },
    })
})
