const Project = require('../models/Project');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const CollabRequest = require('../models/CollabRequest');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalProjects = await Project.countDocuments({ user: req.user.id });

    // Total likes received across all user's projects
    const userProjects = await Project.find({ user: req.user.id });
    const totalLikesReceived = userProjects.reduce((sum, p) => sum + p.likesCount, 0);

    const collabOpenProjects = userProjects.filter((p) => p.lookingForCollab).length;

    res.json({
      user: user.toJSON(),
      stats: {
        totalProjects,
        totalLikesReceived,
        collabOpenProjects,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getIncomingCollabRequests = async (req, res) => {
  try {
    const requests = await CollabRequest.find({ owner: req.user.id })
      .populate('sender', 'name email avatar')
      .populate('project', 'title imageUrl')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSentCollabRequests = async (req, res) => {
  try {
    const requests = await CollabRequest.find({ sender: req.user.id })
      .populate('owner', 'name email avatar')
      .populate('project', 'title imageUrl')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};