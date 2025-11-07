const Blog = require('../models/blogModel');
const sanitizeHtml = require('sanitize-html');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
// const upload = require('../utils/multerConfig')
const validator = require('validator')
const slugify = require('slugify')

const streamifier = require('streamifier');

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: 'blog_images',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    }, (error, result) => {
      if (result) resolve(result);
      else reject(error);
    });

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Helper function for consistent error responses
const sendErrorResponse = (res, status, message, error = null) => {
  const response = { message };
  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error.message;
  }
  return res.status(status).json(response);
};

// Input sanitization options
const sanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt']
  }
};

// Upload image to Cloudinary
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return sendErrorResponse(res, 400, 'No image file provided');
    }
    const result = await uploadToCloudinary(req.file.buffer);
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (err) {
    console.error(err);

    sendErrorResponse(res, 500, 'Error uploading image', err);
    console.log("error while uploading the image", err);
  }
};

// Create a new blog
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      categories = [],
      tags = [],
      status = 'draft',
      metadata = {},
      featuredImage = ''
    } = req.body;

    // Validate and sanitize required fields
    if (!title || !content || !metadata) {
      return sendErrorResponse(res, 400, 'Title, content, and metadata are required.');
    }

    const sanitizedTitle = sanitizeHtml(title, sanitizeOptions).trim();
    const sanitizedContent = sanitizeHtml(content, sanitizeOptions).trim();

    if (!sanitizedTitle || !sanitizedContent) {
      return sendErrorResponse(res, 400, 'Sanitized title and content must not be empty.');
    }

    const slug = slugify(sanitizedTitle, { lower: true, strict: true });

    // Sanitize metadata
    const sanitizedMetadata = {
      metaTitle: sanitizeHtml(metadata.metaTitle || '', sanitizeOptions).trim(),
      metaDescription: sanitizeHtml(metadata.metaDescription || '', sanitizeOptions).trim(),
      keywords: Array.isArray(metadata.keywords)
        ? metadata.keywords.map(keyword => sanitizeHtml(keyword.trim(), sanitizeOptions))
        : []
    };

    // Validate featuredImage URL if provided
    if (featuredImage && !validator.isURL(featuredImage)) {
      return sendErrorResponse(res, 400, 'Featured image must be a valid URL.');
    }

    // Construct blog object
    const blogData = {
      title: sanitizedTitle,
      content: sanitizedContent,
      author: req.user.username,
      categories,
      tags,
      status,
      metadata: sanitizedMetadata,
      featuredImage,
      slug
    };

    const blog = new Blog(blogData);
    await blog.save();

    return res.status(201).json({
      message: 'Blog created successfully.',
      data: blog
    });

  } catch (err) {
    if (err.code === 11000) {
      return sendErrorResponse(res, 400, 'A blog with this slug already exists.');
    }
    console.error('Error creating blog:', err);
    return sendErrorResponse(res, 500, 'Internal server error while creating blog.', err);
  }
};


// try {
  //   const {
  //     page = 1,
  //     limit = 5,
  //     status,
  //     category,
  //     tag,
  //     search
  //   } = req.query;

  //   const currentPage = Number(page);
  //   const pageLimit = Number(limit);

  //   // Build base query
  //   const query = {};

  //   // Apply status, defaulting to 'published' if not provided
  //   query.status = status || 'published';

  //   // Apply category and tag filters
  //   if (category) query.categories = category;
  //   if (tag) query.tags = tag;

  //   // Add search conditions if search is present
  //   if (search) {
  //     query.$or = [
  //       { title: { $regex: search, $options: 'i' } },
  //       { content: { $regex: search, $options: 'i' } },
  //       { tags: { $regex: search, $options: 'i' } }
  //     ];
  //   }

  //   // Fetch filtered and paginated blogs
  //   const blogs = await Blog.find(query)
  //     .skip((currentPage - 1) * pageLimit)
  //     .limit(pageLimit)
  //     .sort({ createdAt: -1 });

  //   // Count total matching documents
  //   const total = await Blog.countDocuments(query);

  //   // Respond with blogs and pagination info
  //   return res.status(200).json({
  //     data: blogs, 
  //     pagination: {
  //       currentPage,
  //       totalPages: Math.ceil(total / pageLimit),
  //       totalBlogs: total
  //     }
  //   });
  // } catch (err) {
  //   console.error(`[BLOG FETCH ERROR]:`, err);

  //   return res.status(500).json({
  //     message: 'An error occurred while fetching blogs.',
  //     error: err.message || err
  //   });
  // }
// Get all blogs with pagination and filtering
exports.getAllBlogs = async (req, res) => {
  

  try {
    // Fetch all blogs without any filters or pagination
    const blogs = await Blog.find()
      .sort({ createdAt: -1 }); // You can sort by creation date or any other field

    // Respond with the blog data
    return res.status(200).json({
      data: blogs,
    });
  } catch (err) {
    console.error(`[BLOG FETCH ERROR]:`, err);

    return res.status(500).json({
      message: 'An error occurred while fetching blogs.',
      error: err.message || err
    });
  }
};


// Get a single blog by ID or slug
exports.getBlogByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let blog;

    if (mongoose.isValidObjectId(idOrSlug)) {
      blog = await Blog.findById(idOrSlug);
    } else {
      blog = await Blog.findOne({ slug: idOrSlug });
    }

    if (!blog) {
      return sendErrorResponse(res, 404, 'Blog not found');
    }

    // Increment views if published
    if (blog.status === 'published') {
      await blog.incrementViews();
    }

    res.json(blog);
  } catch (err) {
    sendErrorResponse(res, 500, 'Error fetching blog', err);
  }
};

// Update a blog
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, categories, tags, status, metadata, featuredImage } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return sendErrorResponse(res, 404, 'Blog not found');
    }

    // Check if user is authorized to update
    if (blog.author !== req.user.username) {
      return sendErrorResponse(res, 403, 'Unauthorized to update this blog');
    }

    // Sanitize inputs
    const updateData = {};
    if (title) updateData.title = sanitizeHtml(title, sanitizeOptions);
    if (content) updateData.content = sanitizeHtml(content, sanitizeOptions);
    if (categories) updateData.categories = categories;
    if (tags) updateData.tags = tags;
    if (status) updateData.status = status;
    if (metadata) updateData.metadata = metadata;
    if (featuredImage) {
      if (!validator.isURL(featuredImage)) {
        return sendErrorResponse(res, 400, 'Featured image must be a valid URL');
      }
      updateData.featuredImage = featuredImage;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Blog updated successfully',
      blog: updatedBlog
    });
  } catch (err) {
    if (err.code === 11000) {
      return sendErrorResponse(res, 400, 'Blog with this slug already exists');
    }
    sendErrorResponse(res, 500, 'Error updating blog', err);
  }
};

// Delete a blog
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return sendErrorResponse(res, 404, 'Blog not found');
    }

    // Check if user is authorized to delete
    if (blog.author !== req.user.username) {
      return sendErrorResponse(res, 403, 'Unauthorized to delete this blog');
    }

    // Delete featured image from Cloudinary if it exists
    if (blog.featuredImage) {
      const publicId = blog.featuredImage.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`blog_images/${publicId}`);
    }

    await Blog.findByIdAndDelete(id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    sendErrorResponse(res, 500, 'Error deleting blog', err);
  }
};

// Add a comment to a blog
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, author } = req.body;

    if (!content || !author) {
      return sendErrorResponse(res, 400, 'Comment content and author are required');
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return sendErrorResponse(res, 404, 'Blog not found');
    }

    const sanitizedComment = {
      content: sanitizeHtml(content, sanitizeOptions),
      author: sanitizeHtml(author, sanitizeOptions)
    };

    await blog.addComment(sanitizedComment);

    res.status(201).json({
      message: 'Comment added successfully',
      blog
    });
  } catch (err) {
    sendErrorResponse(res, 500, 'Error adding comment', err);
  }
};

// Get popular blogs
exports.getPopularBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const blogs = await Blog.getPopular(Number(limit));
    res.json({
      blogs,
      message: 'Popular blogs retrieved successfully'
    });
  } catch (err) {
    sendErrorResponse(res, 500, 'Error fetching popular blogs', err);
  }
};