const express = require('express');
const { getAccessToRoute } = require('../middlewares/authorization/auth');
const router = express.Router({mergeParams:true});
const {
    addNewAnswerToQuestion,
    getAllAnswersByQuestion,
    getSingleAnswer,
    editAnswer,
    deleteAnswer,
    likeAnswer,
    undoLikeAnswer
} = require('../controllers/answer');
const {getAnsweOwnerAccess} = require('../middlewares/authorization/auth');
const {checkQuestionAndAnswerExist} = require('../middlewares/database/databaseErrorHelpers')

router.post('/', getAccessToRoute, addNewAnswerToQuestion);
router.get('/', getAllAnswersByQuestion);
router.get('/:answer_id',checkQuestionAndAnswerExist, getSingleAnswer);
router.get('/:answer_id/like',[checkQuestionAndAnswerExist,getAccessToRoute], likeAnswer);
router.get('/:answer_id/undoLike',[checkQuestionAndAnswerExist,getAccessToRoute], undoLikeAnswer);
router.put('/:answer_id/edit', [checkQuestionAndAnswerExist, getAccessToRoute, getAnsweOwnerAccess], editAnswer);
router.delete('/:answer_id/delete', [checkQuestionAndAnswerExist, getAccessToRoute, getAnsweOwnerAccess], deleteAnswer);


module.exports = router;