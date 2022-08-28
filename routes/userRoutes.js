const express = require('express')
const authController = require('../controllers/authController')

const router = express.Router()

// Authentication
router.post('/signUp', authController.signUp)
router.post('/logIn', authController.logIn)
router.post('/forgotPassword', authController.forgotPassword)
router.post('/resetPassword/:resetToken', authController.resetPassword)
router.post('/updatePassword', authController.protect, authController.updatePassword)

// User data

module.exports = router
