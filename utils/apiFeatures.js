class APIFeatures {
    constructor(query, queryObj) {
        this.query = query
        this.queryObj = queryObj
    }

    find() {
        const excludedFields = ['page', 'limit', 'sort', 'fields']
        const queryObjClone = { ...this.queryObj }
        excludedFields.forEach((field) => delete queryObjClone[field])

        let queryString = JSON.stringify(queryObjClone)
        queryString = queryString.replace(
            /\b(gt|gte|le|lte|elemMatch|in|and|or|regex|options)\b/g,
            (match) => `$${match}`
        )

        const parsedQueryObj = JSON.parse(queryString)

        console.log(parsedQueryObj)
        // APIFeatures.checkBooleanValue(parsedQueryObj)
        this.query.find(parsedQueryObj)

        return this
    }

    sort() {
        if (this.queryObj.sort != null) {
            const sortBy = this.queryObj.sort.split(',').join(' ')
            this.query.sort(sortBy)
        } else {
            this.query.sort('-createdAt')
        }

        return this
    }

    limitFields() {
        if (this.queryObj.fields != null) {
            const fields = this.queryObj.fields.split(',').join(' ')
            this.query.select(fields)
        } else {
            this.query.select('-__v')
        }

        return this
    }

    paginate() {
        const page = this.queryObj.page || 1
        const limit = this.queryObj.limit || 100
        const skip = (page - 1) * limit

        if (this.queryObj.page != null) {
            this.query.skip(skip).limit(limit)
        }

        return this
    }

    static checkBooleanValue(obj) {
        Object.entries(obj).forEach(([key, value]) => {
            if (typeof value !== 'object') {
                if (value === 'true' || value === 'false') obj[key] = value === 'true'
            } else {
                APIFeatures.checkBooleanValue(value)
            }
        })
    }
}

module.exports = APIFeatures
