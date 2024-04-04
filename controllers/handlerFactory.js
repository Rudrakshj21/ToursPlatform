const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new AppError(`No document was not found with Id`), 404);
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};
exports.updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    // console.log(document)
    if (!document) {
      return next(new AppError('document was not found with that ID', 404));
    }

    const allowedUpdates = Object.keys(Model.schema.obj);
    const isValidUpdate = Object.keys(req.body).every((updatedKey) =>
      allowedUpdates.includes(updatedKey),
    );

    if (!isValidUpdate) {
      throw new Error('One of the  requested property does not exist.', 400);
    }

    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });
};

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        document,
      },
    });
  });
};

exports.getOne = (Model, populateOptions = null) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      query.populate(populateOptions);
    }
    const document = await query;
    if (!document) {
      return next(new AppError('No document found with that Id'), 404);
    }
    res.status(200).json({
      document,
    });
  });
};
exports.getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    // Only for review GET nested route
    // console.log(req.query);
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const documents = await features.query.explain();
    const documents = await features.query;

    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: { documents },
    });
  });
};
