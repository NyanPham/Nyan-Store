const Product = require('../models/productModel')
const Variant = require('../models/variantModel')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')

const getVariantFromProduct = async (product, variant) => {
    let newVariant
    try {
        newVariant = (await Product.findById(product)).variants.find((vari) => vari._id?.toString() === variant)
    } catch (err) {
        console.error(err.message)
    }

    return newVariant
}

exports.addToMyCart = catchAsync(async (req, res, next) => {
    const { variant, product, quantity } = req.body

    const variantToAdd = await Variant.findById(variant)

    const cartItem = {
        quantity,
        variant: variantToAdd,
        product,
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            cart: [...req.user.cart, cartItem],
        },
        {
            new: true,
            runValidators: true,
        }
    )

    res.status(200).json({
        status: 'success',
        data: {
            cart: user.cart,
        },
    })
})

exports.getMyCart = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id)

    res.status(200).json({
        status: 'success',
        data: {
            cart: user.cart,
        },
    })
})

exports.updateMyCart = catchAsync(async (req, res, next) => {
    const { product, currentVariant, quantity, variant } = req.body
    const newVariant = await Variant.findById(variant)

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            cart: req.user.cart.map((item) => {
                if (item.product.toString() !== product || item.variant._id.toString() !== currentVariant) {
                    return item
                }

                return {
                    product,
                    variant: newVariant,
                    quantity,
                    addedAt: item.addedAt,
                    updatedAt: Date.now(),
                }
            }),
        },
        {
            new: true,
            runValidators: true,
        }
    )

    res.status(200).json({
        status: 'success',
        data: {
            cart: user.cart,
        },
    })
})

exports.removeMyCart = catchAsync(async (req, res, next) => {
    const { product, variant } = req.body

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            cart: req.user.cart.filter(
                (item) => item.product.toString() !== product && item.variant._id.toString() !== variant
            ),
        },
        {
            new: true,
            runValidators: false,
        }
    )

    res.status(200).json({
        status: 'success',
        data: {
            cart: user.cart,
        },
    })
})
