const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  techStack: {
    type: [String],
    required: [true, 'Tech stack is required'],
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: 'Please add at least one technology',
    },
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Web', 'Mobile', 'AI/ML', 'Design', 'DevOps', 'Game Dev', 'Other'],
  },
  imageUrl: {
    type: String,
    default: '',
  },
  githubLink: {
    type: String,
    default: '',
  },
  demoLink: {
    type: String,
    default: '',
  },
  lookingForCollab: {
    type: Boolean,
    default: false,
  },
  likesCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

projectSchema.index({ title: 'text', techStack: 'text' });

module.exports = mongoose.model('Project', projectSchema);