const express = require('express')
const couponController = require('../controllers/couponController')
const authController = require('../controllers/authController')

const router = express.Router()

router
    .route('/')
    .get(couponController.getAllCoupons)
    .post(authController.protect, authController.restrictTo('admin'), couponController.createCoupon)
router
    .route('/:id')
    .get(couponController.getCoupon)
    .patch(authController.protect, authController.restrictTo('admin'), couponController.updateCoupon)
    .delete(authController.protect, authController.restrictTo('admin'), couponController.deleteCoupon)

module.exports = router
