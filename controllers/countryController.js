const fs = require('fs')
const path = require('path')
const catchAsync = require('../utils/catchAsync')

exports.getCountries = catchAsync(async (req, res, next) => {
    const readFileCb = (err, data) => {
        if (err) return next(err)

        res.status(200).json({
            status: 'success',
            data: {
                countriesAndStates: data,
            },
        })
    }

    fs.readFile(path.join(__dirname, '..', 'dev-data', 'data', 'countries-states.json'), 'utf-8', readFileCb)
})
