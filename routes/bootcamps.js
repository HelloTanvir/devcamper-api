const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamps');

// include other resource routers
const coursesRoute = require('./courses');
const reviewsRoute = require('./reviews');

const router = require('express').Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// re-route into other resource routers
router.use('/:bootcampId/courses', coursesRoute);
router.use('/:bootcampId/reviews', reviewsRoute);

router
    .route('/radius/:zipcode/:distance')
        .get(getBootcampsInRadius);

router
    .route('/:id/photo')
        .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router
    .route('/')
        .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
        .post(protect, authorize('publisher', 'admin'), createBootcamp);
    
router
    .route('/:id')
        .get(getBootcamp)
        .put(protect, authorize('publisher', 'admin'), updateBootcamp)
        .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;