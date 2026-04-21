const mongoose = require('mongoose');

const scriptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    maxlength: [100000, 'Script too large (max 100KB)']
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'bash', 'typescript', 'go', 'rust', 'ruby', 'php', 'java', 'cpp', 'c', 'other'],
    default: 'javascript'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

scriptSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Limit tags to 10
scriptSchema.pre('save', function (next) {
  if (this.tags.length > 10) {
    this.tags = this.tags.slice(0, 10);
  }
  next();
});

module.exports = mongoose.model('Script', scriptSchema);
