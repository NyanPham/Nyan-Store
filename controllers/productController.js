const Product = require('../models/productModel')
const AppError = require('../utils/appError')
const APIFeatures = require('../utils/apiFeatures')
const factory = require('./factoryHandler')
const catchAsync = require('../utils/catchAsync')

exports.getCollectionAndCategoryIds = (req, res, next) => {
    if (req.params.collectionId) req.body.collectionId = req.params.collectionId
    if (req.params.categoryId) req.body.categoryId = req.params.categoryId

    next()
}

exports.getAllProducts = factory.getAll(Product)
exports.createProducts = factory.createOne(Product)
exports.getProduct = factory.getOne(Product)
exports.updateProduct = factory.updateOne(Product)
exports.deleteProduct = factory.deleteOne(Product)

exports.getFilterFacets = catchAsync(async (req, res, next) => {
    const facetOne = Product.aggregate([
        {
            $facet: {
                size: [
                    {
                        $unwind: '$variants',
                    },
                    {
                        $group: {
                            _id: '$variants.option1',
                            variants: { $push: '$variants._id' },
                        },
                    },
                    {
                        $addFields: {
                            value: '$_id',
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                        },
                    },
                ],
                color: [
                    {
                        $unwind: '$variants',
                    },
                    {
                        $group: {
                            _id: '$variants.option2',
                            variants: { $push: '$variants._id' },
                        },
                    },
                    {
                        $addFields: {
                            value: '$_id',
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                        },
                    },
                ],
                material: [
                    {
                        $unwind: '$variants',
                    },
                    {
                        $group: {
                            _id: '$variants.option3',
                            variants: { $push: '$variants._id' },
                        },
                    },
                    {
                        $addFields: {
                            value: '$_id',
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                        },
                    },
                ],
                brand: [
                    {
                        $group: {
                            _id: '$vendor',
                        },
                    },
                    {
                        $addFields: {
                            value: '$_id',
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                        },
                    },
                ],
            },
        },
    ])

    const facets = await Promise.all([facetOne])

    res.status(200).json({
        status: 'success',
        data: {
            facets,
        },
    })
})

exports.filterProducts = catchAsync(async (req, res, next) => {
    const { size, color, material, brand } = req.body.filterQuery
    const { allSize, allColor, allMaterial, allBrand } = req.body.all
    const { skip, limit } = req.body

    // const products = await Product.aggregate([
    //     {
    //         $filter: {
    //             input: '$variants',
    //             as: 'variant',
    //             cond: {
    //                 $elemMatch: {
    //                     option1: {
    //                         $in: size,
    //                     },
    //                 },
    //             },
    //         },
    //     },
    // ])

    const products = await Product.find({
        variants: {
            $elemMatch: {
                $and: [
                    {
                        option1: {
                            $in: size?.length ? size : allSize,
                        },
                    },
                    {
                        option2: {
                            $in: color?.length ? color : allColor,
                        },
                    },
                    {
                        option3: {
                            $in: material?.length ? material : allMaterial,
                        },
                    },
                ],
            },
        },
    })
        .skip(skip)
        .limit(limit)

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: {
            products,
        },
    })
})
