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

exports.getProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id)

    res.status(200).json({
        status: 'success',
        data: {
            product,
        },
    })
})

exports.updateProduct = catchAsync(async (req, res, next) => {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        status: 'success',
        data: {
            product: updatedProduct,
        },
    })
})

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id)

    res.status(204).json({
        status: 'success',
        data: null,
    })
})
