// model
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamps');

// errors handler
const ErrorResponse = require('../utils/ErrorResponse');

// async handler - try catch
const asyncHandler = require('../middleware/async');

const controller = {};

// @desc    get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  public
controller.getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const reviews = await Review.find({bootcamp: req.params.bootcampId});
        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});

// @desc    get single review
// @route   GET /api/v1/reviews/:id
// @access  public
controller.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!review) return next(new ErrorResponse(`No review found with id of ${req.params.id}`, 404));

    res.status(200).json({
        success: true,
        data: review
    });
});

// @desc    add review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  private
controller.addReview = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) return next(new ErrorResponse(`No bootcamp with id of ${req.params.bootcampId}`, 404));

    const review = await Review.create(req.body);

    res.status(201).json({
        success: true,
        data: review
    });
});

// @desc    update review
// @route   PUT /api/v1/reviews/:id
// @access  private
controller.updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review) return next(new ErrorResponse(`No review with id of ${req.params.id}`, 404));

    // make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') return next(new ErrorResponse(`Not authorized to update the review`, 401));

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: review
    });
});

// @desc    delete review
// @route   DELETE /api/v1/reviews/:id
// @access  private
controller.deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) return next(new ErrorResponse(`No review with id of ${req.params.id}`, 404));

    // make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') return next(new ErrorResponse(`Not authorized to update the review`, 401));

    await review.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

module.exports = controller;