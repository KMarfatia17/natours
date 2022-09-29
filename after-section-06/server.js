const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true
    // useCreateIndex: true,
    // useFindAndModify: false
  })
  .then(() => {
    console.log('db connection is successful');
  })
  .catch(err => console.log('see this is the error', err));

// const testTour = new Tour({
//   name: 'the park camper',
//   rating: 4.8,
//   price: 497
// });

// testTour
//   .save()
//   .then(doc => console.log(doc))
//   .catch(err => console.log(err));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// older node JS
process.on('unhandledRejection', err => {
  // console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION, Server is shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

// stack overflow new node JS still not working as expected date 2 years ago means 2020
// process.on('unhandledRejection', function(reason, p) {
//   console.log('Unhandled', reason, p); // log all your errors, "unsuppressing" them.
//   console.log('UNHANDLED REJECTION, Server is shutting down...');
//   throw reason; // optional, in case you want to treat these as errors
// });

process.on('uncaughtException', err => {
  // console.log(err.name, err.message);
  console.log('UNCAUGHT Exception, Server is shutting down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
