const asyncErrorWrapper = require('express-async-handler');

const getSingleUser = asyncErrorWrapper(async (req, res, next) => {
    return res.status(200).json({
        success: true,
        data: req.data
    });
});

const getAllUsers = asyncErrorWrapper(async (req, res, next) => {
    return res.status(200).json(res.queryResults);
});

module.exports = {
    getSingleUser,
    getAllUsers
};
