const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();
app.enable('trust proxy');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// 1 GLOBAL MIDDLEWARES
// serving static files
app.use(express.static(path.join(__dirname, 'public')));
//Set Security http headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        'script-src': [
          "'self'",
          'https://unpkg.com',
          'https://js.stripe.com/v3/',
        ],
        'img-src': [
          "'self'",
          'https://tile.openstreetmap.org',
          'https://unpkg.com',
        ],
        'connect-src': ["'self'", 'ws://localhost:*', 'http://127.0.0.1:3000'],
        'frame-src': ["'self'", 'https://js.stripe.com'],
      },
    },
  }),
);

app.use(cors());
/*implement cross origin resource sharing which sets some headers such as Allow-Cross-Origin *(all routes) but this only works
for simple requests such as get and post for other requests like delete, put, patch or requests which send cookies or non standard headers these are called
non-simple requests . These requests require so called pre flight phase which is initiated by browser where it sends a options request to check
if the request is safe to send or not and we (server) have to respond to this options request and allow cors so browser understands that yes it 
can now send that non-simple request to the server
*/
app.options('*', cors());
// app.options('/api/v1/tours/:id',cors()) // for a specific route only to enable preflight phase
// Development Logger
if (process.env.NODE_ENV === 'development') {
  // console.log('in development mode');
  // logger
  app.use(morgan('dev'));
}
if (process.env.NODE_ENV === 'production') {
  console.log('in production mode');
}

// Limit request from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  // allows 100 req in 1 hr
  message: 'Too many requests from this IP , please try again in an hour!',
});
app.use('/api', limiter);

// BODY PARSER
// converts all (global) incoming requests into json format making it available on req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// prevent xss attacks
app.use(xss());

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// ROUTES
// test middleware
app.use((req, res, next) => {
  // console.log('cookie');
  // console.log(req.cookies);
  next();
});

// Frontend Routes: Responsible for rendering Pug templates for client-side views.
app.use('/', viewRouter);
// Backend Routes: Exclusively for handling API requests and responses.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
// if we have reached here it means request response cycle is not completed yet
// means no route matched the requested url
// all routes which did not match
app.use(compression());
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// global middleware error handler
// skips all middleware in case next(err) is invoked and invoke it
app.use(globalErrorHandler);
module.exports = app;
