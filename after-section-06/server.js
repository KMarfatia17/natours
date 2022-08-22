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
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
