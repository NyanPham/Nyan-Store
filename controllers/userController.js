const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/userModel')
const AppError = require('../utils/appError')
const factory = require('./factoryHandler')
const catchAsync = require('../utils/catchAsync')

const multerStorage = multer.memoryStorage()
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        return cb(null, true)
    }
    return cb(new AppError('Please upload an valid image file [jpg, jpeg, png]', 400), false)
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
})

const filterAllowedFields = (obj, ...allowedFields) => {
    return allowedFields.reduce((filteredObj, field) => {
        if (obj[field] != null) {
            filteredObj[field] = obj[field]
        }

        return filteredObj
    }, {})
}

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    req.body.filename = `user-${req.user._id}-${Date.now().toString()}.jpeg`

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`./public/img/users/${req.body.filename}`)

    next()
})

exports.getMe = (req, res, next) => {
    req.params.id = req.user._id
    req.body.user = req.user._id

    next()
}

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('Password cannot be updated at this route. Please use /updatePassword instead', 403))
    }

    const filteredFields = filterAllowedFields(req.body, 'name', 'email', 'address', 'phone')

    if (req.body.filename != null) filteredFields.photo = req.body.filename

    const user = await User.findByIdAndUpdate(req.user._id, filteredFields, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { active: false })

    res.status(204).json({
        status: 'success',
        data: null,
    })
})

exports.updateOrderNote = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            orderNote: req.body.orderNote,
        },
        {
            new: true,
            runValidators: true,
        }
    )

    res.status(200).json({
        status: 'success',
        data: {
            orderNote: user.orderNote,
        },
    })
})

exports.getOrderNote = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id)

    res.status(200).json({
        status: 'success',
        data: {
            orderNote: user.orderNote,
        },
    })
})

exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)
