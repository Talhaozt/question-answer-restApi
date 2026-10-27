const asyncErrorWrapper = require('express-async-handler');
const { searchHelper, populateHelper, questionSortHelper, paginationHelper } = require('./queryMiddlewareHelper');

const questionQueryMiddleware = function(model, options) {
    return asyncErrorWrapper(async function(req, res, next){
        let query = model.find();

        query = searchHelper('title', query, req);

        const population = options && (options.populate || options.population);
        if (population) {
            query = populateHelper(query, population);
        }

        query = questionSortHelper(query, req);

        const total = await model.countDocuments(query.getFilter());
        const paginationResult = await paginationHelper(total, query, req);
        query = paginationResult.query;

        const queryResults = await query;

        res.queryResults = {
            success: true,
            count: queryResults.length,
            pagination: paginationResult.pagination,
            data: queryResults
        };
        next();
    });
};

module.exports = questionQueryMiddleware;
