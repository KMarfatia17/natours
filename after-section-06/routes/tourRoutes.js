const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

// router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopFiveCheap, tourController.getAllTours);

router.route('/tourStats').get(tourController.TourStats);

router.route('/monthlyPlans/:year').get(tourController.tourMonthlyPlans);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
