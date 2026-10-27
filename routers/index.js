const express = require('express');
const question = require('./question');
const auth = require('./auth');
const user = require('./user');
const admin = require('./admin');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        name: 'Question Answer REST API',
        version: '1.0.0',
        console: '/',
        resources: {
            auth: '/api/auth',
            questions: '/api/questions',
            users: '/api/users',
            admin: '/api/admin'
        }
    });
});

router.use('/questions',question);
router.use('/auth', auth);
router.use('/users', user);
router.use('/admin', admin);

module.exports = router;