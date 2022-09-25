const multer = require('multer')
const sharp = require('sharp')
const Variant = require('../models/variantModel')
const factory = require('../controllers/factoryHandler')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        return cb(null, true)
    }

    cb(new AppError('Please upload valid image files!', 400), false)
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
})

exports.uploadVariantImages = upload.array('images', 8)

exports.resizeVariantImages = catchAsync(async (req, res, next) => {
    req.body.filenames = []
    req.body.photoField = 'images'

    await Promise.all(
        req.files.map(async (file, index) => {
            const filename = `variant-${file.originalname.split('.')[0]}-${Date.now()}-${
                index + 1
            }.jpeg`
            req.body.filenames.push(filename)

            return await sharp(file.buffer)
                .resize(1500, 2000)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`./public/img/products/${filename}`)
        })
    )

    next()
})

exports.setImagesToVariant = catchAsync(async (req, res, next) => {
    if (!req.body.photoField || !req.body.filenames?.length) return next()

    req.body[req.body.photoField] = req.body.filenames

    next()
})

exports.getAllVariants = factory.getAll(Variant)
exports.createVariant = factory.createOne(Variant)
exports.getVariant = factory.getOne(Variant)
exports.updateVariant = factory.updateOne(Variant)
exports.deleteVariant = factory.deleteOne(Variant)
