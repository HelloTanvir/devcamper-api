// model
const Course = require('../models/Courses');
const Bootcamp = require('../models/Bootcamps');

// errors handler
const ErrorResponse = require('../utils/ErrorResponse');

// async handler - try catch
const asyncHandler = require('../middleware/async');

const controller = {};

// @desc    get courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  public
controller.getCourses = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Course.find({bootcamp: req.params.bootcampId});
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});

// @desc    get single course
// @route   GET /api/v1/courses/:id
// @access  public
controller.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404));

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    add course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  private
controller.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404));

    // make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`, 401));

    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    update course
// @route   PUT /api/v1/courses/:id
// @access  private
controller.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404));

    // make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') return next(new ErrorResponse(`User ${req.user.id} is not authorized to update course ${course._id}`, 401));

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    delete course
// @route   DELETE /api/v1/courses/:id
// @access  private
controller.deleteCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404));

    // make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete course ${course._id}`, 401));

    course.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

module.exports = controller;