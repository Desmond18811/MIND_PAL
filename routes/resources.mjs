// Import Express and models
import express from 'express';
import Article from '../models/Article.mjs';
import Course from '../models/Course.mjs';

const router = express.Router();

// Get list of articles
router.get('/articles', async (req, res) => {
    // Explanation: Retrieves all articles from MongoDB
    try {
        const articles = await Article.find().select('title category createdAt');
        res.json(articles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get article details
router.get('/articles/:id', async (req, res) => {
    // Explanation: Finds an article by ID and returns its details
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ error: 'Article not found' });
        res.json(article);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get list of courses
router.get('/courses', async (req, res) => {
    // Explanation: Retrieves all courses from MongoDB
    try {
        const courses = await Course.find().select('title category createdAt');
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get course details
router.get('/courses/:id', async (req, res) => {
    // Explanation: Finds a course by ID and returns its details
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark course as completed
router.post('/courses/:id/complete', async (req, res) => {
    // Explanation: Adds the user to the course's completedBy list
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        if (!course.completedBy.includes(req.user.userId)) {
            course.completedBy.push(req.user.userId);
            await course.save();
        }
        res.json({ message: 'Course marked as completed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
