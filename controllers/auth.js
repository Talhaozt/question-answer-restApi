const crypto = require('crypto');
const User = require('../models/user');
const CustomError = require('../helpers/error/CustomError');
const asyncErrorWrapper = require('express-async-handler');
const { sendJwtToClient } = require('../helpers/authorization/tokenHelpers');
const { validateUserInput, comparePassword } = require('../helpers/input/inputHelpers');
const sendEmail = require('../helpers/libraries/sendEmail');

const register = asyncErrorWrapper(async(req, res, next) => {
    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password
    });

    sendJwtToClient(user, res);
});

const login = asyncErrorWrapper(async(req, res, next) => {
    const { email, password } = req.body;

    if (!validateUserInput(email, password)) {
        return next(new CustomError('Please check your inputs', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !comparePassword(password, user.password)) {
        return next(new CustomError('Please check your credentials', 400));
    }

    if (user.blocked) {
        return next(new CustomError('This account has been blocked', 403));
    }

    sendJwtToClient(user, res);
});

const logout = asyncErrorWrapper(async(req, res, next) => {
    const { NODE_ENV } = process.env;

    return res
        .status(200)
        .cookie('acces_token', 'none', {
            httpOnly: true,
            expires: new Date(Date.now()),
            secure: NODE_ENV === 'development' ? false : true
        })
        .json({
            success: true,
            message: 'Logout Successfull'
        });
});

const getUser = (req, res, next) => {
    res.json({
        success: true,
        data: {
            id: req.user.id,
            name: req.user.name
        }
    });
};

const imageUpload = asyncErrorWrapper(async(req, res, next) => {
    if (!req.savedProfileImage) {
        return next(new CustomError('Please provide a profile image', 400));
    }

    const user = await User.findByIdAndUpdate(req.user.id, {
        profile_image: req.savedProfileImage
    }, {
        new: true,
        runValidators: true
    });

    res.status(200)
        .json({
            success: true,
            message: 'Image Upload Successfull',
            data: user
        });
});

const forgotPassword = asyncErrorWrapper(async(req, res, next) => {
    const resetEmail = req.body.email;
    const user = await User.findOne({ email: resetEmail });

    if (!user) {
        return next(new CustomError('There is no user with that email', 400));
    }

    const resetPasswordToken = user.getResetPasswordTokenFromUser();
    await user.save();

    const resetPasswordUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}`;
    const emailTemplate = `
        <h3>Reset Your Password</h3>
        <p>This <a href='${resetPasswordUrl}' target='_blank'>Link</a> will expire in 1 hour</p>
    `;

    try {
        await sendEmail({
            from: process.env.SMTP_USER,
            to: resetEmail,
            subject: 'Reset Your Password',
            html: emailTemplate
        });
        return res.status(200).json({
            success: true,
            message: 'token sent to your email'
        });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return next(new CustomError('Email Could Not Be Sent', 500));
    }
});

const resetPassword = asyncErrorWrapper(async(req, res, next) => {
    const { resetPasswordToken } = req.query;
    const { password } = req.body;

    if (!resetPasswordToken) {
        return next(new CustomError('Please provide a valid token', 400));
    }

    const hashedToken = crypto
        .createHash('sha256')
        .update(resetPasswordToken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new CustomError('Invalid Token or Session Expired', 404));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(200).json({
        success: true,
        message: 'Reset Password Process Successfull'
    });
});

const editDetails = asyncErrorWrapper(async(req, res, next) => {
    const allowedFields = ['name', 'email', 'title', 'about', 'place', 'website'];
    const editInformation = {};

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            editInformation[field] = req.body[field];
        }
    });

    const user = await User.findByIdAndUpdate(req.user.id, editInformation, {
        new: true,
        runValidators: true
    });

    return res.status(200).json({
        success: true,
        data: user
    });
});

module.exports = {
    register,
    getUser,
    login,
    logout,
    imageUpload,
    forgotPassword,
    resetPassword,
    editDetails
};
