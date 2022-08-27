const Product = require('../models/productModel')

const catchAsync = require('../utils/catchAsync')

exports.getAllProducts = catchAsync(async (req, res, next) => {
    try {
        const products = await Product.find()

        res.status(200).json({
            status: 'success',
            results: products.length,
            data: {
                products,
            },
        })
    } catch (err) {
        next(err)
    }
})

exports.createProducts = catchAsync(async (req, res, next) => {
    const newProduct = await Product.create(req.body)

    res.status(201).json({
        status: 'success',
        data: {
            product: newProduct,
        },
    })
})
