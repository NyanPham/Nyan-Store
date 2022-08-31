const Product = require('../models/productModel')
const AppError = require('../utils/appError')
const APIFeatures = require('../utils/apiFeatures')
const factory = require('./factoryHandler')
const catchAsync = require('../utils/catchAsync')

const getSortBy = (sortTerm) => {
    switch (sortTerm) {
        case 'oldest':
            return {
                createdAt: 1,
            }
        case 'latest':
            return {
                createdAt: -1,
            }
        case 'price-up':
            return {
                price: 1,
            }
        case 'price-down':
            return {
                price: -1,
            }
        case 'alphabet':
            return {
                name: 1,
            }
        default:
            return {
                createdAt: 1,
            }
    }
}

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
                maxPrice: [
                    {
                        $sort: {
                            maxPrice: -1,
                        },
                    },
                    {
                        $limit: 1,
                    },
                    {
                        $project: {
                            maxPrice: 1,
                        },
                    },
                ],
                minPrice: [
                    {
                        $sort: {
                            min: 1,
                        },
                    },
                    {
                        $limit: 1,
                    },
                    {
                        $project: {
                            minPrice: 1,
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
    const { size, color, material, brand, maxPrice, minPrice, skip, limit, sortBy, categoryId } = req.body.filterQuery
    const { allSize, allColor, allMaterial, allBrand } = req.body.all

    const sortByObj = getSortBy(sortBy)

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
                    {
                        price: {
                            $lte: maxPrice,
                            $gte: minPrice,
                        },
                    },
                ],
            },
        },
        vendor: {
            $in: brand.length ? brand : allBrand,
        },
        category: categoryId,
    })
        .skip(skip)
        .limit(limit)
        .sort(sortByObj)

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: {
            products,
        },
    })
})
