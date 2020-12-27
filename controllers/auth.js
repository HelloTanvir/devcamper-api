// to word with reset token
const crypto = require('crypto');

// model
const User = require('../models/User');

// errors handler
const ErrorResponse = require('../utils/ErrorResponse');

// async handler - try catch
const asyncHandler = require('../middleware/async');

// handle reset password email
const sendEmail = require('../utils/sendEmail');

// controller scaffolding
const controller = {};

// @desc    register user
// @route   POST /api/v1/auth/register
// @access  public
controller.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // create user
    const user = await User.create({ name, email, password, role });

    sendTokenResponse(user, 200, res);
});

// @desc    login user
// @route   POST /api/v1/auth/login
// @access  public
controller.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // validate email & password
    if (!email || !password) return next(new ErrorResponse('Please provide an email and password', 400));

    // check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) return next(new ErrorResponse('Invalid credentials', 401)); //401 -> unauthorized

    // check if password matches
    const isMatch = await user.matchPassword(password);

    if ( !isMatch) return next(new ErrorResponse('Invalid credentials', 401));

    sendTokenResponse(user, 200, res);
});

// @desc    log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  private
controller.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    get current logged in user
// @route   POST /api/v1/auth/me
// @access  private
controller.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  private
controller.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    update password
// @route   PUT /api/v1/auth/updatepassword
// @access  private
controller.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // check current password
    if (!(await user.matchPassword(req.body.currentPassword))) return next(new ErrorResponse('Password is incorrect', 401));

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc    forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  public
controller.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return next(new ErrorResponse('There is no user with that email', 404));

    // get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a put request to: \n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        });

        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  public
controller.resetPassword = asyncHandler(async (req, res, next) => {
    // get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return next(new ErrorResponse('Invalid token', 400));

    // set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') options.secure = true;

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        });
}

module.exports = controller;