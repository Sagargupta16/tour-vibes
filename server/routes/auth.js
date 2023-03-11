const express = require('express');
const validator = require('express-validator');

const authControllers = require('../controllers/auth');
const User = require('../models/users');

const router = express.Router();

const validation = [
    validator.body('email').isEmail().withMessage('Enter a valid email-id')
    .custom(async value => {
        const user = await User.findOne({ email: value });
        if (user) {
            return Promise.reject('User already registered');
        }
    }).normalizeEmail({gmail_remove_dots: false}),
    validator.body('password').trim().isLength({min: 5}).withMessage('Enter correct password of length more than 5 letters'),
    validator.body('name').trim().not().isEmpty().withMessage('Name cannot be empty')
];

router.put('/signup', validation, authControllers.signup);
router.post('/login', authControllers.login);

module.exports = router;