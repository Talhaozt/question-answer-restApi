const asyncErrorWrapper = require('express-async-handler');
const { populateHelper, paginationHelper } = require('./queryMiddlewareHelper');

const answerQueryMiddleware = function(model, options) {
    return asyncErrorWrapper(async function(req, res, next){
        const { id } = req.params;
        const question = await model.findById(id);

        const total = question.answersCount || 0;
        const paginationResult = await paginationHelper(total, undefined, req);
        const { startIndex, limit, pagination } = paginationResult;

        const query = model.find(
            { _id: id },
            { answers: { $slice: [startIndex, limit] } }
        );

        if (options && options.population) {
            populateHelper(query, options.population);
        }

        const queryResults = await query;
        res.queryResults = {
            success: true,
            pagination,
            data: queryResults[0] || queryResults
        };

        next();
    });
};

module.exports = answerQueryMiddleware;
