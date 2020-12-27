const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const errorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');

// protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        // set token from cookie (optional, if I want to use cookies)
        token = req.cookies.token;
    }

    // make sure token exists
    if (!token) return next(new errorResponse('Not authorized to get access to this route', 401));

    try {
        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log(decoded);

        req.user = await User.findById(decoded.id);

        next()
    } catch (err) {
        return next(new errorResponse('Not authorized to get access to this route', 401));
    }
});

exports.authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(new errorResponse(`User role ${req.user.role} is not authorized to get access to this route`, 403));
    next();
}