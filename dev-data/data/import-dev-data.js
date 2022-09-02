const fs = require('fs')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const Product = require('../../models/productModel')
const User = require('../../models/userModel')
const Collection = require('../../models/collectionModel')
const Category = require('../../models/categoryModel')

dotenv.config({ path: `${__dirname}/../../config.env` })
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

const products = JSON.parse(fs.readFileSync(`${__dirname}/products.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
const collections = JSON.parse(fs.readFileSync(`${__dirname}/collections.json`, 'utf-8'))
const categories = JSON.parse(fs.readFileSync(`${__dirname}/categories.json`, 'utf-8'))
const variants = JSON.parse(fs.readFileSync(`${__dirname}/variants.json`, 'utf-8'))

const importData = async () => {
    try {
        await Product.create(products)
        // await User.create(users)
        // await Collection.create(collections)
        // await Category.create(categories)

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
        // await User.deleteMany()
        // await Collection.deleteMany()
        // await Category.deleteMany()

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
