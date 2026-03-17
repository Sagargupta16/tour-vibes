const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
   {
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
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: true
      },
      tags: [
         {
            type: String,
            trim: true,
            lowercase: true
         }
      ],
      location: {
         name: { type: String, default: '' },
         country: { type: String, default: '' }
      },
      travelDate: {
         type: Date
      },
      likes: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
         }
      ]
   },
   {
      timestamps: true
   }
);

postSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Post', postSchema);
