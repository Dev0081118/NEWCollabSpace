const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

likeSchema.index({ project: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);