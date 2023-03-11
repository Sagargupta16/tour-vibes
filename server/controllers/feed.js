const express = require('express');
const mongoose = require('mongoose');
const validator = require('express-validator');
const fs = require('fs');
const path = require('path');

const Post = require('../models/post');
const User = require('../models/users');

exports.getPosts = (req, res, next) => {
    const page = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Post.find().count()
        .then(numberOfPosts => {
            totalItems = numberOfPosts;
            return Post.find().populate('creator').skip((page-1)*perPage).limit(perPage);
        })
        .then(posts => {
            if(!posts) {
                const error = new Error('No Posts found');
                error.statusCode = 404;
                throw error;
            } else {
                
                res.status(200).json({message: 'Fetched Successfully', posts: posts, totalItems: totalItems});
            }
        })
        .catch(err => {
            if(!err.statusCode)
                err.statusCode = 422;
            next(err);
        });
};  

exports.getUserPosts = (req, res, next) => {
    const page = req.query.page || 1;
    const userId = mongoose.Types.ObjectId(req.params.userId);
    console.log(userId);
    const perPage = 2;
    let totalItems;
    Post.find({creator: userId}).count()
        .then(numberOfPosts => {
            console.log(numberOfPosts);
            totalItems = numberOfPosts;
            return Post.find({creator: userId}).populate('creator').skip((page-1)*perPage).limit(perPage);
        })
        .then(posts => {
            if(!posts) {
                const error = new Error('No Posts found');
                error.statusCode = 404;
                throw error;
            } else {
                
                res.status(200).json({message: 'Fetched Successfully', posts: posts, totalItems: totalItems});
            }
        })
        .catch(err => {
            if(!err.statusCode)
                err.statusCode = 422;
            next(err);
        });
};  

exports.createPost = async (req, res, next) => {
    const errors = validator.validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        throw error;
    }

    if(!req.file) {
        const error = new Error('Image not found');
        error.statusCode = 422;
        throw error;
    }

    const userId = req.userId;

    const imageUrl = req.file.path.replace('\\', '/');
    const title = req.body.title;
    const content = req.body.content;
    

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId
    });

    const user = await User.findById(req.userId);
    user.posts.push(post);

    await user.save();

    post.save()
        .then(result => {
            res.status(200).json({
                message: 'Post successfully created',
                post: post
            });
        })
        .catch(err => {
            if(!err.statusCode)
                err.statusCode = 500;
            next(err);
        });
};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId).populate('creator').exec()
        .then(post => {
            if(!post) {
                const error = new Error('No post found');
                error.statusCode = 404;
                throw error;
            } else {
                res.status(200).json({message: 'Fetched Successfully', post: post});
            }
        })
        .catch(err => {
            if(!err.statusCode)
                err.statusCode = 500;
            next(err);
        });
};

exports.udpatePost = (req, res, next) => {
    const postId = req.params.postId;
    const errors = validator.validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        throw error;
    }
    
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;

    if(req.file) {
        imageUrl = req.file.path;
        if(!imageUrl) {
            const error = new Error('Image not uploaded');
            error.statusCode = 422;
            throw error;
        }
    }

    Post.findById(postId)
        .then(post => {
            if(!post) {
                const error = new Error('No post found');
                error.statusCode = 404;
                throw error;
            } else {
                if(imageUrl !== post.imageUrl) {
                    clearImage(post.imageUrl);
                }
                post.title = title;
                post.content = content;
                post.imageUrl = imageUrl.replace('\\', '/');
                return post.save();
            }
        })
        .then(result => {
            res.status(200).json({message: 'Post updated Successfully', post: result});
        })
        .catch(err => {
            if(!err.statusCode)
                err.statusCode = 500;
            next(err);
        });
};

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => {
        if(err)
            console.log(err);
    });
};

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;
    const user = await User.findById(req.userId);
    Post.findById(postId)
        .then(async post => {
            if(!post) {
                const error = new Error('No such post exists');
                error.statusCode = 404;
                throw error;
            }
            const reqdIndex = user.posts.findIndex(p => p.toString() == postId.toString());
            user.posts.splice(reqdIndex, 1);
            return user.save()
                .then(result => {
                    clearImage(post.imageUrl);
                    return Post.findByIdAndDelete(postId);
                });
        })
        .then(result => {
            console.log(result);
            res.status(200).json({message: 'Post deleted Successfully'});
        })
        .catch(err => {
            if(!err.statusCode)
                err.statusCode = 500;
            next(err);
        });
};