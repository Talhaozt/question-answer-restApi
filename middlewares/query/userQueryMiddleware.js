const asyncErrorWrapper = require('express-async-handler');
const { searchHelper, paginationHelper } = require('./queryMiddlewareHelper');

const userQueryMiddleware = function(model) {
    return asyncErrorWrapper(async function(req, res, next){
        let query = model.find();

        query = searchHelper('name', query, req);

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

module.exports = userQueryMiddleware;
