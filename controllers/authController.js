const { promisify } = require('util')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const sendEmail = require('../utils/email')

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    })

const signAndSendToken = (user, res, statusCode) => {
    const token = signToken(user._id)
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 10 * 60 * 1000),
        secure: false,
    }

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

    res.cookie('jwt', token, cookieOptions)
    res.status(statusCode).json({
        status: 'success',
        token,
    })
}

exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        photo: req.body.photo,
        cart: [],
        orders: [],
        address: req.body.address,
        phone: req.body.phone,
    })

    if (newUser == null) return next(new AppError('Failed to sign up', 400))

    signAndSendToken(newUser, res, 201)
})

exports.logIn = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    const correctPassword = await user?.comparePassword(password, user.password)

    if (user == null || !correctPassword) {
        return next(new AppError('Incorrect email or password. Please try again...', 401))
    }

    signAndSendToken(user, res, 200)
})

exports.protect = catchAsync(async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }

    if (token == null) {
        return next(new AppError('You have not logged in. Please log in to continue', 403))
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    const currentUser = await User.findById(decoded.id)
    if (currentUser == null) {
        return next(new AppError('The user belonging to the token does no longer exist. Please log in again', 400))
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('The password has been changed. Please log in again to continue', 403))
    }

    req.user = currentUser
    next()
})

exports.restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError('You have no permission to implement the action', 403))
        }

        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    const token = user?.createResetToken()
    await user?.save({ validateBeforeSave: false })

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${token}`
    const message = `Click the link below to reset your password\n${resetUrl}\nThe reset token is only valid in 10 minutes. Be hurry!`

    try {
        await sendEmail({
            to: user?.email,
            subject: 'RESET PASSWORD WITH TOKEN',
            message,
        })

        res.status(200).json({
            status: 'success',
            message: 'Reset token has been sent!',
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to send reset token',
            error: err,
        })
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({
        resetPasswordToken: crypto.createHash('sha256').update(req.params.resetToken).digest('hex'),
        resetPasswordExpires: {
            $gte: Date.now(),
        },
    })
    if (user == null) {
        return next(new AppError('The reset token has expired. Please try again...', 400))
    }

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.resetPasswordExpires = undefined
    user.resetPasswordToken = undefined
    await user.save()

    signAndSendToken(user, res, 200)
})
