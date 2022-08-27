const express = require('express')

const productRouter = require('./routes/productRoutes')

const app = express()

// Transfer data to process
app.use(express.json({ limit: '10kb' }))

// Routes
app.use('/api/v1/products', productRouter)

module.exports = app
