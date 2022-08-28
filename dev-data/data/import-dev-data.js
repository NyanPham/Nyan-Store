const fs = require('fs')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const Product = require('../../models/productModel')

dotenv.config({ path: `${__dirname}/../../config.env` })
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

const products = JSON.parse(fs.readFileSync(`${__dirname}/products.json`, 'utf-8'))

const importData = async () => {
    try {
        await Product.create(products)
        console.log('Database is imported successfully')
    } catch (err) {
        console.log('Database is failed to import: ', `${err.message}`)
    } finally {
        process.exit()
    }
}

const deleteData = async () => {
    try {
        await Product.deleteMany()
        console.log('Database is deleted successfully')
    } catch (err) {
        console.log('Failed to delete data:', `${err.message}`)
    } finally {
        process.exit()
    }
}

mongoose.connect(DB).then(async () => {
    // await deleteData()
    await importData()
})
