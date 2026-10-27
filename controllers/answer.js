const Question = require('../models/Questions');
const Answer = require('../models/Answer');
const CustomError = require('../helpers/error/CustomError');
const asyncErrorWrapper = require('express-async-handler');

const hasLiked = (likes, userId) => {
    return likes.some((like) => like.toString() === userId.toString());
};

const addNewAnswerToQuestion = asyncErrorWrapper(async (req, res, next) => {
    const { question_id } = req.params;
    const { content } = req.body;

    const answer = await Answer.create({
        content,
        question: question_id,
        user: req.user.id
    });

    return res.status(201).json({
        success: true,
        data: answer
    });
});

const getAllAnswersByQuestion = asyncErrorWrapper(async (req, res, next) => {
    const { question_id } = req.params;
    const question = await Question.findById(question_id).populate({
        path: 'answers',
        populate: {
            path: 'user',
            select: 'name profile_image'
        }
    });

    return res.status(200).json({
        success: true,
        count: question.answers.length,
        data: question.answers
    });
});

const getSingleAnswer = asyncErrorWrapper(async (req, res, next) => {
    const { answer_id } = req.params;
    const answer = await Answer.findById(answer_id)
        .populate({
            path: 'question',
            select: 'title'
        })
        .populate({
            path: 'user',
            select: 'name profile_image'
        });

    return res.status(200).json({
        success: true,
        data: answer
    });
});

const editAnswer = asyncErrorWrapper(async (req, res, next) => {
    const { answer_id } = req.params;
    const { content } = req.body;
    const answer = await Answer.findById(answer_id);

    if (content !== undefined) {
        answer.content = content;
        await answer.save();
    }

    return res.status(200).json({
        success: true,
        data: answer
    });
});

const deleteAnswer = asyncErrorWrapper(async (req, res, next) => {
    const { answer_id, question_id } = req.params;

    await Answer.findByIdAndDelete(answer_id);

    const question = await Question.findById(question_id);
    question.answers = question.answers.filter(
        (id) => id.toString() !== answer_id.toString()
    );
    question.answersCount = question.answers.length;
    await question.save();

    return res.status(200).json({
        success: true,
        message: 'Answer deleted successfully'
    });
});

const likeAnswer = asyncErrorWrapper(async (req, res, next) => {
    const { answer_id } = req.params;
    const answer = await Answer.findById(answer_id);

    if (hasLiked(answer.likes, req.user.id)) {
        return next(new CustomError('You already like this answer', 400));
    }

    answer.likes.push(req.user.id);
    await answer.save();

    return res.status(200).json({
        success: true,
        data: answer
    });
});

const undoLikeAnswer = asyncErrorWrapper(async (req, res, next) => {
    const { answer_id } = req.params;
    const answer = await Answer.findById(answer_id);

    if (!hasLiked(answer.likes, req.user.id)) {
        return next(new CustomError('You can not undo like operation for this answer', 400));
    }

    answer.likes = answer.likes.filter(
        (like) => like.toString() !== req.user.id.toString()
    );
    await answer.save();

    return res.status(200).json({
        success: true,
        data: answer
    });
});

module.exports = {
    addNewAnswerToQuestion,
    getAllAnswersByQuestion,
    getSingleAnswer,
    editAnswer,
    deleteAnswer,
    likeAnswer,
    undoLikeAnswer
};
