const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// post tours/tourid/reviews
// get tours/tourid/reviews
// get tours/tourid/reviews/reviewId

// router
//   .route('/tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourAndUserIds,
    reviewController.createReview
  );

router.get('/getreview', reviewController.getReview);

router
  .route('/:id')
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;