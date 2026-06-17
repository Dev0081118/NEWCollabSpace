const { validationResult } = require('express-validator');
const CollabRequest = require('../models/CollabRequest');
const Project = require('../models/Project');

exports.sendRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.user.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot send collaboration request to your own project' });
    }

    if (!project.lookingForCollab) {
      return res.status(400).json({ message: 'This project is not open for collaboration' });
    }

    const existing = await CollabRequest.findOne({
      project: req.params.id,
      sender: req.user.id,
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already sent a request for this project' });
    }

    const collabRequest = await CollabRequest.create({
      project: req.params.id,
      sender: req.user.id,
      owner: project.user,
      message: req.body.message,
    });

    const populated = await collabRequest.populate([
      { path: 'sender', select: 'name email avatar' },
      { path: 'project', select: 'title' },
    ]);

    res.status(201).json({ collabRequest: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const collabRequest = await CollabRequest.findById(req.params.id);
    if (!collabRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (collabRequest.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    collabRequest.status = 'Accepted';
    await collabRequest.save();

    const populated = await collabRequest.populate([
      { path: 'sender', select: 'name email avatar' },
      { path: 'project', select: 'title' },
    ]);

    res.json({ collabRequest: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const collabRequest = await CollabRequest.findById(req.params.id);
    if (!collabRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (collabRequest.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }

    collabRequest.status = 'Rejected';
    await collabRequest.save();

    const populated = await collabRequest.populate([
      { path: 'sender', select: 'name email avatar' },
      { path: 'project', select: 'title' },
    ]);

    res.json({ collabRequest: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};