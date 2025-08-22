const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../utils/multerConfig')

// ---------- PUBLIC ROUTES ----------

// Get all blogs with pagination, filtering, search
router.get('/', blogController.getAllBlogs);

// Get popular blogs
router.get('/popular/list', blogController.getPopularBlogs);

// Get a single blog by ID or slug
router.get('/:idOrSlug', blogController.getBlogByIdOrSlug);

// Add a comment to a blog (requires authentication)
router.post('/:id/comments', blogController.addComment);

// ---------- PROTECTED ROUTES (AUTH REQUIRED) ----------

// Upload image to Cloudinary
router.post('/upload-image', authMiddleware, upload.single('image'), blogController.uploadImage);

// Create blog
router.post('/', authMiddleware, blogController.createBlog);

// Update blog
router.put('/:id', authMiddleware, blogController.updateBlog);

// Delete blog
router.delete('/:id', authMiddleware, blogController.deleteBlog);

module.exports = router;