const Like = require('../models/Like');
const Project = require('../models/Project');

exports.toggleLike = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const existingLike = await Like.findOne({ user: req.user.id, project: projectId });

    if (existingLike) {
      // Unlike
      await Like.findByIdAndDelete(existingLike._id);
      project.likesCount = Math.max(0, project.likesCount - 1);
      await project.save();
      return res.json({ liked: false, likesCount: project.likesCount });
    } else {
      // Like
      await Like.create({ user: req.user.id, project: projectId });
      project.likesCount += 1;
      await project.save();
      return res.json({ liked: true, likesCount: project.likesCount });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};