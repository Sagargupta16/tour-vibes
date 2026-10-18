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
         country: { type: String, default: '' },
         // Optional map pin, set by clicking the map in the post form
         lat: { type: Number, min: -90, max: 90 },
         lng: { type: Number, min: -180, max: 180 }
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
// Serves the map view's bounding-box query (GET /feed/map?bbox=...)
postSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('Post', postSchema);
