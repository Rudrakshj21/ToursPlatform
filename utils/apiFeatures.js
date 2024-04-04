class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    // console.log('in filter');
    // BUILD THE QUERY
    // 1) Filtering
    // shallow copy to remove excluded fields
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    // console.log(this.queryString, queryObj);

    // 2) Advanced Filtering
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, (match) => {
      return `$${match}`;
    });
    this.query = this.query.find(JSON.parse(queryString));
    // console.log(this.query);

    return this;
  }

  sort() {
    // 3 sorting

    // console.log('in sort');
    if (this.queryString.sort) {
      console.log(this.queryString)
      const sortBy = this.queryString.sort.split(',').join(' ');
      // console.log(sortBy);
      this.query = this.query.sort(sortBy);
      // sort('firstProp secondProp')
    } else {
      this.query = this.query.sort('-createdAt');
    }
    // console.log(this.query);
    // console.log(this.queryString);

    return this;
  }

  limitFields() {
    // console.log('in limited fields');
    // 4 Field limiting
    // console.log(this.queryString.fields);
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      //query.select('name duration ratingsAverage')
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // excluding __v field
    }

    return this;
  }
  paginate() {
    // 5 Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // page=2&limit=10 1-10 page 1 , 11-20 page 2 ....
    // console.log('page', page, 'limit', limit, 'skip', skip);
    this.query = this.query.skip(skip).limit(limit);

    // // check for page containing no results
    // if (this.queryString.page) {
    //   const totalDocs = await Tour.countDocuments();
    //   if (totalDocs <= skip) {
    //     throw new Error('This page does not exist');
    //   }
    // }

    return this;
  }
}
module.exports = APIFeatures;
