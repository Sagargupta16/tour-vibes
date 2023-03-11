const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type:String,
        default: 'I am new'
    },
    posts: [{
        type: mongoose.Types.ObjectId,
        ref: 'Post'
    }]
});

module.exports = mongoose.model('user', userSchema);