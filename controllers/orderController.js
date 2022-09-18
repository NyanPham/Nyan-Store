require('dotenv').config({ path: './config.env' })

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Order = require('../models/orderModel')
const User = require('../models/userModel')
const Product = require('../models/productModel')
const Variant = require('../models/variantModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const factory = require('./factoryHandler')

const createOrderFromSession = async (res, session, line_items) => {
    const total = session.amount_total
    const user = await User.findOne({ email: session.customer_email })

    const purchasedItems = line_items.data.map((itemData) => {
        const metadata = itemData.price.product.metadata
        return {
            product: metadata.product_id,
            variant: metadata.variant_id,
            quantity: parseInt(metadata.quantity),
        }
    })

    const newOrder = await Order.create({
        total,
        items: purchasedItems,
        user: user._id,
    })

    res.status(200).json({
        status: 'success',
        session,
        purchasedItems,
        newOrder,
    })
}

exports.getWebhookSession = async (req, res, next) => {
    const signature = req.headers['stripe-signature']

    let event, session, purchased_line_items

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_CHECKOUT_KEY)
    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            err: err,
            message: err.message,
        })
    }

    switch (event.type) {
        case 'checkout.session.completed':
            session = event.data.object

            const { line_items } = await stripe.checkout.sessions.retrieve(session.id, {
                expand: ['line_items.data.price.product'],
            })

            purchased_line_items = line_items
            break
        default:
            session = null
    }

    await createOrderFromSession(res, session, purchased_line_items)
}

exports.getUserId = (req, res, next) => {
    if (req.params.userId) req.body.user = req.params.userId

    const parsedUrl = req.originalUrl.split('/')

    if (parsedUrl[parsedUrl.length - 1].startsWith('my')) {
        req.body.user = req.user._id
    }

    next()
}

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    if (req.user == null || req.body.items.length == 0)
        return next(new AppError('Failed to proceed to checkout'))

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
                        metadata: {
                            product_id: product._id.toString(),
                            variant_id: variant._id.toString(),
                            quantity: item.quantity,
                        },
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
        success_url: 'https://elaborate-chimera-ea1e59.netlify.app/',
        cancel_url: 'https://elaborate-chimera-ea1e59.netlify.app/',
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
