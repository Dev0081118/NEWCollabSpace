const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Project = require('../models/Project');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const CollabRequest = require('../models/CollabRequest');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Like.deleteMany({}),
      Comment.deleteMany({}),
      CollabRequest.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create demo users
    const users = await User.create([
      { name: 'Alex Johnson', email: 'alex@example.com', password: 'password123' },
      { name: 'Sarah Chen', email: 'sarah@example.com', password: 'password123' },
      { name: 'Marcus Rivera', email: 'marcus@example.com', password: 'password123' },
      { name: 'Priya Patel', email: 'priya@example.com', password: 'password123' },
      { name: 'Demo User', email: 'demo@example.com', password: 'password123' },
    ]);
    console.log('Created demo users');

    // Create demo projects
    const projects = await Project.create([
      {
        user: users[0]._id,
        title: 'EcoTrack - Carbon Footprint Analyzer',
        description: 'A full-stack web application that helps users track their carbon footprint through daily activities. Features include travel logging, energy usage monitoring, and personalized reduction recommendations. Built with a modern tech stack and interactive data visualizations.',
        techStack: ['React', 'Node.js', 'MongoDB', 'Chart.js', 'Tailwind CSS'],
        category: 'Web',
        imageUrl: '',
        githubLink: 'https://github.com/demo/ecotrack',
        demoLink: 'https://ecotrack-demo.vercel.app',
        lookingForCollab: true,
        likesCount: 24,
      },
      {
        user: users[1]._id,
        title: 'MediMind - AI Health Assistant',
        description: 'An AI-powered mobile health assistant that provides symptom checking, medication reminders, and health tips. Uses machine learning models trained on medical datasets to offer preliminary health insights. Built with React Native for cross-platform compatibility.',
        techStack: ['React Native', 'Python', 'TensorFlow', 'Firebase', 'TypeScript'],
        category: 'Mobile',
        imageUrl: '',
        githubLink: 'https://github.com/demo/medimind',
        demoLink: 'https://medimind.app',
        lookingForCollab: true,
        likesCount: 42,
      },
      {
        user: users[2]._id,
        title: 'ArtVision - AI Art Generator',
        description: 'A cutting-edge AI/ML application that transforms text descriptions into stunning artwork. Uses stable diffusion models fine-tuned on various art styles. Includes a community gallery, style mixing, and high-resolution export capabilities.',
        techStack: ['Python', 'PyTorch', 'FastAPI', 'React', 'Docker'],
        category: 'AI/ML',
        imageUrl: '',
        githubLink: 'https://github.com/demo/artvision',
        demoLink: '',
        lookingForCollab: true,
        likesCount: 56,
      },
      {
        user: users[3]._id,
        title: 'PixelPerfect - Design System',
        description: 'A comprehensive design system with 200+ components built for modern web applications. Includes typography scales, color palettes, icon sets, and fully responsive UI components with dark mode support and accessibility features.',
        techStack: ['Figma', 'React', 'Storybook', 'CSS Modules', 'TypeScript'],
        category: 'Design',
        imageUrl: '',
        githubLink: 'https://github.com/demo/pixelperfect',
        demoLink: 'https://pixelperfect-ds.vercel.app',
        lookingForCollab: false,
        likesCount: 31,
      },
      {
        user: users[0]._id,
        title: 'CloudDeploy - Devops Platform',
        description: 'A streamlined DevOps platform that automates deployment pipelines, monitors server health, and manages infrastructure as code. Supports multiple cloud providers and integrates with popular CI/CD tools.',
        techStack: ['Go', 'Kubernetes', 'Terraform', 'AWS', 'Prometheus'],
        category: 'DevOps',
        imageUrl: '',
        githubLink: 'https://github.com/demo/clouddeploy',
        demoLink: '',
        lookingForCollab: true,
        likesCount: 18,
      },
      {
        user: users[4]._id,
        title: 'QuestForge - RPG Game Engine',
        description: 'A browser-based RPG game engine that allows creators to build their own adventure games without coding. Features a visual editor, quest system, inventory management, and multiplayer support.',
        techStack: ['Unity', 'C#', 'Node.js', 'WebGL', 'PostgreSQL'],
        category: 'Game Dev',
        imageUrl: '',
        githubLink: 'https://github.com/demo/questforge',
        demoLink: 'https://questforge.io',
        lookingForCollab: true,
        likesCount: 35,
      },
      {
        user: users[1]._id,
        title: 'SmartHome IoT Dashboard',
        description: 'A comprehensive IoT dashboard for managing smart home devices. Features real-time monitoring, automated routines, energy optimization, and voice control integration with major smart home ecosystems.',
        techStack: ['React', 'Node.js', 'MQTT', 'InfluxDB', 'Grafana'],
        category: 'Web',
        imageUrl: '',
        githubLink: 'https://github.com/demo/smarthome',
        demoLink: '',
        lookingForCollab: false,
        likesCount: 15,
      },
      {
        user: users[2]._id,
        title: 'LangBridge - Real-time Translator',
        description: 'A real-time language translation app that supports 50+ languages with speech recognition and text-to-speech. Uses transformer models for natural translations and includes a conversation mode for seamless communication.',
        techStack: ['Flutter', 'Python', 'Hugging Face', 'WebSocket', 'Redis'],
        category: 'Mobile',
        imageUrl: '',
        githubLink: 'https://github.com/demo/langbridge',
        demoLink: 'https://langbridge.app',
        lookingForCollab: true,
        likesCount: 28,
      },
    ]);
    console.log('Created demo projects');

    // Create some likes
    const likeData = [];
    for (let i = 0; i < projects.length; i++) {
      for (let j = 0; j < users.length; j++) {
        if (Math.random() > 0.4 && projects[i].user.toString() !== users[j]._id.toString()) {
          likeData.push({
            project: projects[i]._id,
            user: users[j]._id,
          });
        }
      }
    }
    await Like.create(likeData);
    console.log('Created demo likes');

    // Create some comments
    const commentData = [
      { project: projects[0]._id, user: users[1]._id, text: 'This is amazing! The carbon tracking feature is exactly what we need.' },
      { project: projects[0]._id, user: users[2]._id, text: 'Great work on the visualizations. Would love to contribute!' },
      { project: projects[1]._id, user: users[0]._id, text: 'The AI symptom checker is really impressive. How did you train the model?' },
      { project: projects[1]._id, user: users[3]._id, text: 'Would be great to add telehealth integration!' },
      { project: projects[2]._id, user: users[4]._id, text: 'The art generation quality is stunning. What model are you using?' },
      { project: projects[2]._id, user: users[1]._id, text: 'I\'d love to collaborate on the style mixing feature!' },
      { project: projects[3]._id, user: users[0]._id, text: 'This design system is so comprehensive. Great documentation too!' },
      { project: projects[4]._id, user: users[3]._id, text: 'The Kubernetes integration is really well done.' },
      { project: projects[5]._id, user: users[2]._id, text: 'The visual editor is super intuitive. Great for non-programmers!' },
      { project: projects[6]._id, user: users[4]._id, text: 'Real-time monitoring is smooth. Which IoT protocols do you support?' },
    ];
    await Comment.create(commentData);
    console.log('Created demo comments');

    console.log('✅ Seed data created successfully!');
    console.log('Demo accounts (all use password: password123):');
    console.log('  - alex@example.com');
    console.log('  - sarah@example.com');
    console.log('  - marcus@example.com');
    console.log('  - priya@example.com');
    console.log('  - demo@example.com');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();