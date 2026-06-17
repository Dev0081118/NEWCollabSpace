const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProjects,
  getTrendingProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { toggleLike } = require('../controllers/likeController');
const { getComments, addComment } = require('../controllers/commentController');

router.get('/', optionalAuth, getProjects);
router.get('/trending', optionalAuth, getTrendingProjects);
router.get('/:id', optionalAuth, getProject);

router.post(
  '/',
  protect,
  upload.single('image'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('techStack').notEmpty().withMessage('Tech stack is required'),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  createProject
);

router.put(
  '/:id',
  protect,
  upload.single('image'),
  updateProject
);

router.delete('/:id', protect, deleteProject);

// Like
router.post('/:id/like', protect, toggleLike);

// Comments
router.get('/:id/comments', getComments);
router.post(
  '/:id/comments',
  protect,
  [body('text').trim().notEmpty().withMessage('Comment text is required')],
  addComment
);

module.exports = router;