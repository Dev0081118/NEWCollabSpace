const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { deleteComment } = require('../controllers/commentController');

router.delete('/:id', protect, deleteComment);

module.exports = router;