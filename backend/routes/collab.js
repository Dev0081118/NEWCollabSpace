const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { sendRequest, acceptRequest, rejectRequest } = require('../controllers/collabController');

router.post(
  '/:id/collab-requests',
  protect,
  [body('message').trim().notEmpty().withMessage('Message is required')],
  sendRequest
);

router.post('/:id/accept', protect, acceptRequest);
router.post('/:id/reject', protect, rejectRequest);

module.exports = router;