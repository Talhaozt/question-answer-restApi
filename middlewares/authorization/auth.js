const CustomError = require('../../helpers/error/CustomError');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');
const Question = require('../../models/Questions');
const asyncErrorWrapper = require('express-async-handler');
const { isTokenIncluded, getAccessTokenFromHeader } = require('../../helpers/authorization/tokenHelpers');
const Answer = require('../../models/Answer');

const getAccessToRoute = (req, res, next) => {
    const { JWT_SECRET_KEY } = process.env;

    if (!isTokenIncluded(req)) {
        return next(new CustomError('You are not authorized to access this route', 401));
    }

    const accessToken = getAccessTokenFromHeader(req);

    jwt.verify(accessToken, JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return next(new CustomError('You are not authorized to access this route', 401));
        }

        req.user = {
            id: decoded.id,
            name: decoded.name
        };
        next();
    });
};

const getAdminAccess = asyncErrorWrapper(async(req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'admin') {
        return next(new CustomError('Only admins can access this route', 403));
    }
    next();
});

const getQuestionOwnerAccess = asyncErrorWrapper(async (req, res, next) => {
    const question = await Question.findById(req.params.id);

    if (!question) {
        return next(new CustomError('There is no such question with that id', 400));
    }

    if (question.user.toString() !== req.user.id.toString()) {
        return next(new CustomError('Only owner can handle this operation', 403));
    }
    next();
});

const getAnsweOwnerAccess = asyncErrorWrapper(async (req, res, next) => {
    const answer = await Answer.findById(req.params.answer_id);

    if (!answer) {
        return next(new CustomError('There is no such answer associated with that id', 400));
    }

    if (answer.user.toString() !== req.user.id.toString()) {
        return next(new CustomError('Only owner can handle this operation', 403));
    }
    next();
});

module.exports = {
    getAccessToRoute,
    getAdminAccess,
    getQuestionOwnerAccess,
    getAnsweOwnerAccess
};
