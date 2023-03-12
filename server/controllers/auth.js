const validator = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/users');

exports.signup = (req, res, next) => {
    const error = validator.validationResult(req);
    if(!error.isEmpty()) {
        const err = new Error('Validation failed');
        err.statusCode = 422;
        err.data = error.array();
        throw err;
    }
    const name = req.body.name;
    const email = req.body.email;
    let password = req.body.password;

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            password = hashedPassword;
            const user = new User({
                name: name,
                email: email,
                password: password
            });
            return user.save();
        })
        .then(result => {
            res.status(200).json({message: 'User successfully registered'});
        })
        .catch(err => {
            if(!err.statusCode)
                err.statusCode = 500;
            next(err);
        })
};

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await User.findOne({email: email});
        if (user) {
            const matched = await bcrypt.compare(password, user.password);
            if(matched) {
                const token = jwt.sign({
                    email: user.email,
                    userId: user._id.toString()
                }, 'somesupersecretsecret', {
                    expiresIn: '1h'
                });
                console.log(user.name);
                res.status(200).json({token: token, name: user.name, userId: user._id.toString()});
            } 
            else {
                const err = new Error('Incorrect password');
                err.statusCode = 422;
                throw err;
            }
        } else {
            const err = new Error('No such user found');
            err.statusCode = 422;
            throw err;
        }
    } catch(err) {
        if(!err.statusCode)
            err.statusCode = 500;
        throw err;
    }
    
};