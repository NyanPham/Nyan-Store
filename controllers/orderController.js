require('dotenv').config({ path: './config.env' })

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const Variant = require('../models/variantModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const factory = require('./factoryHandler')

exports.getUserId = (req, res, next) => {
    if (req.params.userId) req.body.user = req.params.userId

    const parsedUrl = req.originalUrl.split('/')

    if (parsedUrl[parsedUrl.length - 1].startsWith('my')) {
        req.body.user = req.user._id
    }

    next()
}

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    if (req.user == null || req.body.items.length == 0) return next(new AppError('Failed to proceed to checkout'))

    const lineItems = await Promise.all(
        req.body.items.map(async (item) => {
            const product = await Product.findById(item.product)
            const variant = await Variant.findById(item.variant._id)
            return {
                price_data: {
                    product_data: {
                        name: variant.name,
                        description: product.summary,
                        images: variant.images,
                    },
                    unit_amount: variant.price * 100,
                    currency: 'USD',
                },
                quantity: item.quantity,
            }
        })
    )

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: 'http://127.0.0.1:8080/',
        cancel_url: 'http://127.0.0.1:8080/cart',
        customer_email: req.user.email,
        line_items: lineItems,
        mode: 'payment',
        client_reference_id: `order-${req.user._id}-${Date.now().toString()}`,
    })

    res.status(201).json({
        status: 'success',
        session,
    })
})

exports.getAllOrders = factory.getAll(Order)
exports.createOrder = factory.createOne(Order)
exports.getOrder = factory.getOne(Order)
exports.updateOrder = factory.updateOne(Order)
exports.deleteOrder = factory.deleteOne(Order)
