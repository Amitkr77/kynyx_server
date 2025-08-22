const mongoose = require('mongoose');
const validator = require('validator');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [2, 'Comment must be at least 2 characters long'],
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  author: {
    type: String,
    required: [true, 'Comment author is required'],
    trim: true,
    minlength: [2, 'Comment author name must be at least 2 characters long'],
    maxlength: [50, 'Comment author name cannot exceed 50 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
    validate: {
      validator: function(value) {
        return !validator.contains(value, '<script');
      },
      message: 'Title cannot contain script tags'
    }
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    minlength: [10, 'Content must be at least 10 characters long'],
    validate: {
      validator: function(value) {
        return !validator.contains(value, '<script');
      },
      message: 'Content cannot contain script tags'
    }
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    minlength: [2, 'Author name must be at least 2 characters long'],
    maxlength: [50, 'Author name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'published', 'archived'],
      message: '{VALUE} is not a valid status'
    },
    default: 'draft'
  },
  categories: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  readTime: {
    type: Number,
    min: [0, 'Read time cannot be negative'],
    default: 0
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  comments: [commentSchema],
  metadata: {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [70, 'Meta title cannot exceed 70 characters']
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [50, 'Keyword cannot exceed 50 characters']
    }]
  },
  featuredImage: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        return !value || validator.isURL(value);
      },
      message: 'Featured image must be a valid URL'
    }
  },
  featuredImagePublicId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for optimized queries
// blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ categories: 1, createdAt: -1 });
blogSchema.index({ tags: 1 });

// Virtual for formatted date
blogSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for comment count
blogSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Pre-save middleware for slug generation and read time calculation
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 50);
  }
  
  if (this.isModified('content')) {
    // Estimate read time (assuming 200 words per minute)
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }
  
  next();
});

// Pre-validate middleware to ensure unique categories and tags
blogSchema.pre('validate', function(next) {
  this.categories = [...new Set(this.categories)]; // Remove duplicates
  this.tags = [...new Set(this.tags)]; // Remove duplicates
  next();
});

// Method to increment views
blogSchema.methods.incrementViews = async function() {
  this.views += 1;
  return await this.save();
};

// Method to add a comment
blogSchema.methods.addComment = async function(commentData) {
  this.comments.push(commentData);
  return await this.save();
};

// Static method to find published blogs
blogSchema.statics.findPublished = function(query = {}) {
  return this.find({ ...query, status: 'published' })
    .select('-comments');
};

// Static method to search blogs by text
blogSchema.statics.search = function(searchTerm) {
  return this.find({
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { content: { $regex: searchTerm, $options: 'i' } },
      { tags: { $regex: searchTerm, $options: 'i' } }
    ],
    status: 'published'
  });
};

// Static method to get popular blogs
blogSchema.statics.getPopular = function(limit = 5) {
  return this.find({ status: 'published' })
    .sort({ views: -1, createdAt: -1 })
    .limit(limit);
};

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;