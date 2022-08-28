const fs = require('fs')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const Product = require('../../models/productModel')
const User = require('../../models/userModel')

dotenv.config({ path: `${__dirname}/../../config.env` })
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

const products = JSON.parse(fs.readFileSync(`${__dirname}/products.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))

const importData = async () => {
    try {
        await Product.create(products)
        await User.create(users)

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
        await User.deleteMany()

        console.log('Database is deleted successfully')
    } catch (err) {
        console.log('Failed to delete data:', `${err.message}`)
    } finally {
        process.exit()
    }
}

mongoose.connect(DB).then(async () => {
    await deleteData()
    // await importData()
})
