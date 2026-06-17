const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const CollabRequest = require('../models/CollabRequest');
const fs = require('fs');
const path = require('path');

exports.getProjects = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { techStack: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const projects = await Project.find(query)
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    let userLikes = [];
    if (req.user) {
      const likes = await Like.find({
        user: req.user.id,
        project: { $in: projects.map((p) => p._id) },
      });
      userLikes = likes.map((l) => l.project.toString());
    }

    const projectsWithLikes = projects.map((project) => ({
      ...project.toObject(),
      likedByUser: userLikes.includes(project._id.toString()),
    }));

    res.json({
      projects: projectsWithLikes,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTrendingProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('user', 'name email avatar')
      .sort({ likesCount: -1, createdAt: -1 })
      .limit(6);

    let userLikes = [];
    if (req.user) {
      const likes = await Like.find({
        user: req.user.id,
        project: { $in: projects.map((p) => p._id) },
      });
      userLikes = likes.map((l) => l.project.toString());
    }

    const projectsWithLikes = projects.map((project) => ({
      ...project.toObject(),
      likedByUser: userLikes.includes(project._id.toString()),
    }));

    res.json({ projects: projectsWithLikes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('user', 'name email avatar');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    let likedByUser = false;
    if (req.user) {
      const like = await Like.findOne({ user: req.user.id, project: project._id });
      likedByUser = !!like;
    }

    res.json({
      ...project.toObject(),
      likedByUser,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, techStack, category, githubLink, demoLink, lookingForCollab } = req.body;

    const techStackArr = typeof techStack === 'string'
      ? techStack.split(',').map((t) => t.trim()).filter(Boolean)
      : techStack;

    const project = await Project.create({
      user: req.user.id,
      title,
      description,
      techStack: techStackArr,
      category,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
      githubLink: githubLink || '',
      demoLink: demoLink || '',
      lookingForCollab: lookingForCollab === 'true' || lookingForCollab === true,
    });

    const populated = await project.populate('user', 'name email avatar');
    res.status(201).json({ project: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this project' });
    }

    const { title, description, techStack, category, githubLink, demoLink, lookingForCollab } = req.body;

    project.title = title || project.title;
    project.description = description || project.description;
    if (techStack) {
      project.techStack = typeof techStack === 'string'
        ? techStack.split(',').map((t) => t.trim()).filter(Boolean)
        : techStack;
    }
    project.category = category || project.category;
    project.githubLink = githubLink !== undefined ? githubLink : project.githubLink;
    project.demoLink = demoLink !== undefined ? demoLink : project.demoLink;
    project.lookingForCollab = lookingForCollab !== undefined
      ? (lookingForCollab === 'true' || lookingForCollab === true)
      : project.lookingForCollab;

    if (req.file) {
      // Delete old image if exists
      if (project.imageUrl) {
        const oldPath = path.join(__dirname, '..', project.imageUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      project.imageUrl = `/uploads/${req.file.filename}`;
    }

    await project.save();
    const populated = await project.populate('user', 'name email avatar');
    res.json({ project: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    // Delete associated records
    await Like.deleteMany({ project: project._id });
    await Comment.deleteMany({ project: project._id });
    await CollabRequest.deleteMany({ project: project._id });

    // Delete image file
    if (project.imageUrl) {
      const imgPath = path.join(__dirname, '..', project.imageUrl);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await Project.findByIdAndDelete(project._id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};