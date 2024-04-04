const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour name is missing'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minLength: [10, 'A tour name must have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain letters.'],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      // enum: ['easy', 'medium', 'difficult'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Tour price is missing'],
    },
    // Custom validator
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (inputValue) {
          //this only points to current doc on NEW document creation
          return inputValue < this.price;
        },
        message: 'Discount price({VALUE}) must be below regular price ',
      },
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a description'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // hide it from the output
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: [Number], //long,lat
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);
// storing index for price field in ascending order(1)
// tourSchema.index({ price: 1 });
// compound index
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
// creating virtual property
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// virtual populate (solves child referencing / 2 way referencing)
tourSchema.virtual('reviews', {
  ref: 'Review',
  // reference to the field of other model which is linked to this model
  foreignField: 'tour',
  localField: '_id',
  // id in this model(Tour) is same as tour field in other model(Review)
});

//Document middleware : runs before .save() and .create() and not on insertMany/find/update

// example of embedding
// tourSchema.pre('save', async function (next) {
//   const guides = this.guides.map(async (id) => await User.findById(id));
//   console.log(guides);
//   this.guides = await Promise.all(guides);
//   console.log(this.guides);

//   next();
// });

tourSchema.pre('save', function (next) {
  console.log('slugify....');
  // this points to document which is being processed
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post('save', function (doc, next) {
//   console.log('post save hook');
//   console.log(doc);
//   next();
// });

//  QUERY MIDDLEWARE

// we want this middleware to trigger for all commands starting with find (findOne)
tourSchema.pre(/^find/, function (next) {
  // this  : query
  // SECRET TOURS ARE EXCLUDED
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// POPULATION GUIDES
tourSchema.pre(/^find/, function (next) {
  // console.log(docs === this);
  this.populate({
    path: 'guides',
  });
  next();
});
// POST QUERY HOOK EXAMPLE
tourSchema.post(/^find/, function (docs, next) {
  // this  : docs after query executed
  console.log(`time taken for query ${Date.now() - this.start}`);
  // console.log(docs);
  next();
});
// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   // console.log(this.pipeline());
//   const stage = {
//     $match: {
//       secretTour: { $ne: true },
//     },
//   };
//   this.pipeline().unshift(stage);
//   console.log(this.pipeline());
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
