const Product = require('../models/productModel')
const Variant = require('../models/variantModel')
const APIFeatures = require('../utils/apiFeatures')
const factory = require('./factoryHandler')
const catchAsync = require('../utils/catchAsync')
const redisClient = require('../utils/initCache')

const getSortQuery = (sortTerm) => {
    switch (sortTerm) {
        case 'oldest':
            return '-createdAt'
        case 'latest':
            return 'createdAt'
        case 'price-up':
            return 'price'
        case 'price-down':
            return '-price'
        case 'alphabet':
            return 'name'
        default:
            return ''
    }
}

const createSearchRegexQuery = (searchRegex) => {
    return [
        {
            name: searchRegex,
        },
        {
            vendor: searchRegex,
        },
        {
            tags: searchRegex,
        },
        {
            SKU: searchRegex,
        },
    ]
}

const filterOptionsIfAny = (options, allOptions) => {
    return options?.length ? options : allOptions || []
}

const filterVariantIds = async (props) => {
    const { size, allSize, color, allColor, material, allMaterial, minPrice, maxPrice } = props

    const variantAggregation = [
        {
            $match: {
                price: {
                    $gte: minPrice,
                    $lte: maxPrice,
                },
            },
        },
        {
            $project: {
                _id: 1,
            },
        },
    ]

    const option1Array = filterOptionsIfAny(size, allSize)
    const option2Array = filterOptionsIfAny(color, allColor)
    const option3Array = filterOptionsIfAny(material, allMaterial)

    if (option1Array.length > 0 && option1Array.length !== allSize.length)
        variantAggregation[0].$match['option1'] = {
            $in: option1Array,
        }

    if (option2Array.length > 0 && option2Array.length !== allColor.length)
        variantAggregation[0].$match['option2'] = {
            $in: option2Array,
        }

    if (option3Array.length > 0 && option3Array.length !== allMaterial.length)
        variantAggregation[0].$match['option3'] = {
            $in: option3Array,
        }

    const variantIds = await Variant.aggregate(variantAggregation)
    return variantIds
}

const filterProductFromFacets = async (props) => {
    const {
        categoryId,
        variantIds,
        brand,
        allBrand,
        searchRegexObj,
        categoryName,
        sortByTerm,
        page,
        limit,
    } = props

    const productFilterQuery = {
        category: categoryId,
        variants: {
            $in: variantIds,
        },
        vendor: {
            $in: filterOptionsIfAny(brand, allBrand),
        },
        $or: createSearchRegexQuery(searchRegexObj),
    }

    if (categoryName.toLowerCase() === 'all') delete productFilterQuery['category']

    const productsCountQuery = Product.countDocuments(productFilterQuery)

    const productsQuery = Product.find(productFilterQuery)
        .sort(getSortQuery(sortByTerm))
        .skip((page - 1) * limit)
        .limit(limit)

    const productsResult = await Promise.all([productsCountQuery, productsQuery])

    return {
        productCount: productsResult[0],
        products: productsResult[1],
    }
}

exports.getCollectionAndCategoryIds = (req, res, next) => {
    if (req.params.collectionId) req.body.collectionId = req.params.collectionId
    if (req.params.categoryId) req.body.categoryId = req.params.categoryId

    next()
}

exports.filterProducts = catchAsync(async (req, res, next) => {
    const {
        size,
        color,
        material,
        brand,
        maxPrice,
        minPrice,
        sortByTerm,
        categoryId,
        searchTerm,
        categoryName,
        limit,
        page,
    } = req.body.filterQuery
    const { allSize, allColor, allMaterial, allBrand } = req.body.all
    const searchRegexObj = {
        $regex: searchTerm ? `^${searchTerm}` : '',
        $options: 'mix',
    }

    const variantIds = await filterVariantIds({
        color,
        allColor,
        size,
        allSize,
        material,
        allMaterial,
        minPrice,
        maxPrice,
    })

    const { productCount, products } = await filterProductFromFacets({
        categoryId,
        categoryName,
        variantIds,
        searchRegexObj,
        sortByTerm,
        brand,
        allBrand,
        page,
        limit,
    })

    res.status(200).json({
        status: 'success',
        results: productCount,
        data: {
            docs: products,
        },
    })
})

exports.getFilterFacets = catchAsync(async (req, res, next) => {
    const lookUpVariantStage = {
        $lookup: {
            from: 'variants',
            let: { variant_ids: '$variants', vendor: '$vendor' },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $in: ['$_id', '$$variant_ids'],
                        },
                    },
                },
                {
                    $facet: {
                        size: APIFeatures.createFacetsQuery('option1'),
                        color: APIFeatures.createFacetsQuery('option2'),
                        material: APIFeatures.createFacetsQuery('option3'),
                        maxPrice: APIFeatures.createMaxMinPriceFacetQuery(-1),
                        minPrice: APIFeatures.createMaxMinPriceFacetQuery(1),
                        brand: [
                            {
                                $group: {
                                    _id: '$$vendor',
                                },
                            },
                            {
                                $addFields: {
                                    value: '$_id',
                                },
                            },
                            {
                                $project: {
                                    value: 1,
                                    _id: 0,
                                },
                            },
                        ],
                    },
                },
            ],
            as: 'facets',
        },
    }

    const getFacetFieldStage = {
        $project: {
            facets: {
                $first: '$facets',
            },
        },
    }

    const unwindOption = (option) => {
        return { $unwind: option }
    }

    const groupFacetStage = {
        $group: {
            _id: null,
            size: {
                $addToSet: '$facets.size',
            },
            color: {
                $addToSet: '$facets.color',
            },
            material: {
                $addToSet: '$facets.material',
            },
            maxPrice: {
                $max: '$facets.maxPrice.value',
            },
            minPrice: {
                $min: '$facets.minPrice.value',
            },
            brand: {
                $addToSet: '$facets.brand',
            },
        },
    }

    const eliminateIdFieldStage = {
        $project: {
            _id: 0,
        },
    }

    const productFacetsAggregation = [
        lookUpVariantStage,
        getFacetFieldStage,
        unwindOption('$facets.size'),
        unwindOption('$facets.color'),
        unwindOption('$facets.material'),
        unwindOption('$facets.brand'),
        groupFacetStage,
        eliminateIdFieldStage,
    ]

    if (req.query.category != null) {
        const matchCategoryStage = {
            $match: {
                $expr: {
                    $eq: ['$category', { $toObjectId: req.query.category }],
                },
            },
        }
        productFacetsAggregation.unshift(matchCategoryStage)
    }

    const facets = await Product.aggregate(productFacetsAggregation)

    res.status(200).json({
        status: 'success',
        data: {
            facets,
        },
    })
})

exports.getProductFromSlug = catchAsync(async (req, res, next) => {
    const tour = await Product.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        populate: { path: 'user' },
    })

    res.status(200).json({
        status: 'success',
        data: {
            doc: tour,
        },
    })
})

exports.getAllProducts = factory.getAll(Product)
exports.createProducts = factory.createOne(Product)
exports.getProduct = factory.getOne(Product, { path: 'reviews', populate: { path: 'user' } })
exports.updateProduct = factory.updateOne(Product)
exports.deleteProduct = factory.deleteOne(Product)
