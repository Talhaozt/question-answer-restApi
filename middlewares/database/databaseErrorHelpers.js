const User = require('../../models/user');
const Question = require('../../models/Questions');
const Answer = require('../../models/Answer');
const CustomError = require('../../helpers/error/CustomError');
const asyncErrorWrapper = require('express-async-handler');

const checkUserExist = asyncErrorWrapper(async(req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
        return next(new CustomError('There is no such user with that id', 400));
    }

    req.data = user;
    next();
});

const checkQuestionsExist = asyncErrorWrapper(async(req, res, next) => {
    const question_id = req.params.id || req.params.question_id;
    const question = await Question.findById(question_id);

    if (!question) {
        return next(new CustomError('There is no such question with that id', 400));
    }

    req.question = question;
    next();
});

const checkQuestionAndAnswerExist = asyncErrorWrapper(async(req, res, next) => {
    const { question_id, answer_id } = req.params;

    const answer = await Answer.findOne({
        _id: answer_id,
        question: question_id
    });

    if (!answer) {
        return next(new CustomError('There is no such answer associated with question id', 400));
    }

    req.answer = answer;
    next();
});

module.exports = {
    checkUserExist,
    checkQuestionsExist,
    checkQuestionAndAnswerExist
};
