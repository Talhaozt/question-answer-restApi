const Questions = require('../models/Questions');
const Answer = require('../models/Answer');
const CustomError = require('../helpers/error/CustomError');
const asyncErrorWrapper = require('express-async-handler');

const hasLiked = (likes, userId) => {
    return likes.some((like) => like.toString() === userId.toString());
};

const askNewQuestion = asyncErrorWrapper(async(req, res, next) => {
    const { title, content } = req.body;

    const question = await Questions.create({
        title,
        content,
        user: req.user.id
    });

    res.status(201).json({
        success: true,
        data: question
    });
});

const getAllQuestions = asyncErrorWrapper(async(req, res, next) => {
    return res.status(200).json(res.queryResults);
});

const getSingleQuestion = asyncErrorWrapper(async(req, res, next) => {
    return res.status(200).json(res.queryResults);
});

const editQuestions = asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const question = await Questions.findById(id);

    if (title !== undefined) question.title = title;
    if (content !== undefined) question.content = content;

    await question.save();

    return res.status(200).json({
        success: true,
        data: question
    });
});

const deleteQuestions = asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;

    await Answer.deleteMany({ question: id });
    await Questions.findByIdAndDelete(id);

    return res.status(200).json({
        success: true,
        message: 'Question Delete Operation Successful'
    });
});

const likeQuestions = asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    const question = await Questions.findById(id);

    if (hasLiked(question.likes, req.user.id)) {
        return next(new CustomError('You already like this question', 400));
    }

    question.likes.push(req.user.id);
    question.likeCount = question.likes.length;
    await question.save();

    return res.status(200).json({
        success: true,
        data: question
    });
});

const undolikeQuestions = asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    const question = await Questions.findById(id);

    if (!hasLiked(question.likes, req.user.id)) {
        return next(new CustomError('You can not undo like operation for this question', 400));
    }

    question.likes = question.likes.filter(
        (like) => like.toString() !== req.user.id.toString()
    );
    question.likeCount = question.likes.length;
    await question.save();

    return res.status(200).json({
        success: true,
        data: question
    });
});

module.exports = {
    askNewQuestion,
    getAllQuestions,
    getSingleQuestion,
    editQuestions,
    deleteQuestions,
    likeQuestions,
    undolikeQuestions
};
