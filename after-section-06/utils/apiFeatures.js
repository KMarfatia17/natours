class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const reqQueryObj = { ...this.queryString };
    const excludedQuery = ['limit', 'page', 'fields', 'sort'];
    excludedQuery.forEach(el => delete reqQueryObj[el]);

    // console.log('reqQueryObj: ', reqQueryObj, ':end');

    let queryStr = JSON.stringify(reqQueryObj);
    queryStr = queryStr.replace(
      /\b(gte|lte|gt|lt)\b/g,
      matchedWord => `$${matchedWord}`
    );

    this.query = this.query.find(JSON.parse(queryStr));
    // console.log('this.query', this.query);
    // console.log('check THIS', this);
    // console.log('check THIS.QUERY', this.query);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortQuery = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortQuery);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitedFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
