const express = require('express');
const Question = require('../models/Questions');
const answer = require('./answer');
const { getAllQuestions, askNewQuestion, getSingleQuestion, editQuestions, deleteQuestions, likeQuestions, undolikeQuestions } = require('../controllers/question');
const {checkQuestionsExist} = require('../middlewares/database/databaseErrorHelpers');
const{getAccessToRoute, getQuestionOwnerAccess} = require('../middlewares/authorization/auth'); 
const questionQueryMiddleware = require('../middlewares/query/questionQueryMiddleware');
const answerQueryMiddleware = require('../middlewares/query/answerQueryMiddleware');
const router = express.Router();

router.get('/:id/like', [getAccessToRoute, checkQuestionsExist], likeQuestions);
router.get('/:id/undo_like', [getAccessToRoute, checkQuestionsExist], undolikeQuestions);
router.get('/',questionQueryMiddleware(
    Question,{
        population: {
            path: 'user',
            select: 'name profile_image'
        }
    }
), getAllQuestions);
router.get('/:id', checkQuestionsExist,answerQueryMiddleware(Question, {
    population: [
        {
            path: 'user',
            select: 'name profile_image'
        },
        {
            path:'answers',
            select: 'content'
        }
    ]
}) , getSingleQuestion);
router.post('/ask',getAccessToRoute, askNewQuestion);
router.put('/:id/edit', [getAccessToRoute, checkQuestionsExist, getQuestionOwnerAccess], editQuestions);
router.delete('/:id/delete',[getAccessToRoute, checkQuestionsExist, getQuestionOwnerAccess], deleteQuestions)

router.use('/:question_id/answers',checkQuestionsExist, answer);


module.exports = router;