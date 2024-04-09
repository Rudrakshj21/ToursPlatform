const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const {
  createOne,
  getOne,
  getAll,
  updateOne,
  deleteOne,
} = require('./../controllers/handlerFactory');
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1 Get currently booked tour
  const tour = await Tour.findById(req.params.tourID);
  // 2 create checkout session
  const session = await stripe.checkout.sessions.create({
    // session information
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    mode: 'payment',
    // product information
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price, // Assuming tour.price is already in the smallest currency unit (e.g., cents)
          product_data: {
            name: `${tour.name} Tour`,
            description: `${tour.summary}`,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1, // Quantity of the product
      },
    ],
    billing_address_collection: 'auto',
  });

  // 3 create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // temporary as it is not secure as everyone can make bookings without paying just by hitting the url with the query
  const { tour, user, price } = req.query;
  if (!tour || !user || !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getBooking = getOne(Booking);
exports.getAllBooking = getAll(Booking);
exports.createBooking = createOne(Booking);
exports.updateBooking = updateOne(Booking);
exports.deleteBooking = deleteOne(Booking);
