const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
   {
      email: {
         type: String,
         required: true,
         unique: true
      },
      name: {
         type: String,
         required: true
      },
      password: {
         type: String,
         required: true
      },
      bio: {
         type: String,
         default: '',
         maxlength: 300
      },
      avatar: {
         type: String,
         default: ''
      },
      location: {
         type: String,
         default: ''
      },
      status: {
         type: String,
         default: 'I am new'
      },
      posts: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
         }
      ]
   },
   {
      timestamps: true
   }
);

module.exports = mongoose.model('User', userSchema);
