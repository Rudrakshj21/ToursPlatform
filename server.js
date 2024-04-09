const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({
  path: './config.env',
});

// must be before any synchronous code
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION 🔥 Shutting down....');
  // console.log(err.name, err.message);
  // must always be exited (unclean state)
  process.exit(1);
});
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose.connect(DB).then((con) => {
  // console.log(con.connections);
  console.log('DB connection successfully ✅');
});

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App  running on port : ${port}`);
});
// globally handling all unhandled promise rejections (all asynchronous )
process.on('unhandledRejection', (err) => {
  // console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION 🔥 Shutting down....');

  // abruptly handling
  // process.exit(1);
  // 0 - success 1- uncaught exception
  // graceful
  server.close(() => {
    process.exit(1);
  });
});
// console.log(testingUnhandledException);
