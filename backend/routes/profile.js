const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProfile,
  getUserProjects,
  getIncomingCollabRequests,
  getSentCollabRequests,
} = require('../controllers/profileController');

router.get('/', protect, getProfile);
router.get('/projects', protect, getUserProjects);
router.get('/collab-requests/incoming', protect, getIncomingCollabRequests);
router.get('/collab-requests/sent', protect, getSentCollabRequests);

module.exports = router;