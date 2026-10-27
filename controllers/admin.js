const asyncErrorWrapper = require('express-async-handler');

const blockUser = asyncErrorWrapper(async(req, res, next) => {
    const user = req.data;
    user.blocked = !user.blocked;
    await user.save();

    return res.status(200).json({
        success: true,
        message: user.blocked ? 'User blocked successfully' : 'User unblocked successfully'
    });
});

const deleteUser = asyncErrorWrapper(async (req, res, next) => {
    const user = req.data;
    await user.deleteOne();

    return res.status(200).json({
        success: true,
        message: 'Delete Operation Successful'
    });
});

module.exports = {
    blockUser,
    deleteUser
};
