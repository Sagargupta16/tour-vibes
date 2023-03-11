const mongoose = require('mongoose');
const users = require('./users');

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.Types.ObjectId,
        ref: users,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);