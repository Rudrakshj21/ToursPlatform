const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./../controllers/handlerFactory');
exports.aliasTopTours = (req, res, next) => {
  // console.log('in alias top tour');
  // req.body.limit = '5';
  // req.body.sort = '-ratingsAverage,price';
  // req.body.fields = 'name,price,ratingsAverage,summary,difficulty';
  req.query = {
    limit: 5,
    sort: "-ratingsAverage,price'",
    fields: 'name,price,ratingsAverage,summary,difficulty',
  };
  next();
};

exports.getAllTours = getAll(Tour);
exports.getTour = getOne(Tour, { path: 'reviews' });
exports.createTour = createOne(Tour);
exports.updateTour = updateOne(Tour);
exports.deleteTour = deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        // _id: '$ratingsAverage',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        numTours: -1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    // destructor
    {
      $unwind: '$startDates',
    },
    // select documents for year passed in
    {
      $match: {
        // start date must be greater or equal to first day of that year or last day of that year
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $project: {
        _id: 0,
        month: '$_id',
        numTours: 1,
        tours: 1,
      },
    },
    {
      $sort: {
        numTours: -1,
      },
    },
    // {
    //   $limit :3
    // }
  ]);

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan,
    },
  });
});

// '/tours-within/:distance/center/:latlng/unit/:unit'
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  // console.log(distance, latlng, unit);
  // '/tours-within/:distance/center/17.3851607,32131.21,/unit/:unit'
  const [lat, long] = latlng.split(',');
  // console.log(lat, long);
  if (!lat || !long) {
    return next(
      new AppError(
        'Please ensure latitude and longitude are in the format ...center/lat,long/...',
        400,
      ),
    );
  }
  // converting unit to radians by dividing with radius of earth (miles,kilometer)
  const radius = unit == 'mi' ? distance / 3963.2 : distance / 6378.1;
  const tour = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[long, lat], radius],
      },
    },
  });
  res.status(200).json({
    status: 200,
    results: tour.length,
    data: {
      tour,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format : distances/lat,lng/..',
      ),
    );
  }
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const distances = await Tour.aggregate([
    // must always be the first stage and near is compulsory
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
        spherical: true,
      },
    },
    { $project: { name: 1, distance: 1 } },
  ]);
  console.log(distances);
  res.status(200).json({
    status: 'success',
    data: {
      distances,
    },
  });
});
