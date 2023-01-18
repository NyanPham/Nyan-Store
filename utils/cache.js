const mongoose = require('mongoose')
const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.exec = async function () {
    console.log(this)
    console.log(this.getQuery())

    await this.apply(exec, arguments)
}
