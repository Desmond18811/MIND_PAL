
// Import Express and models
import express from 'express';
import Article from '../models/Article.js';
import Course from '../models/Course.js';

const router = express.Router();

// Search resources (articles, courses)
router.get('/resources', async (req, res) => {
    // Explanation: Searches articles and courses based on query parameter
    try {
        const { q } = req.query; // e.g., ?q=meditation
        const articles = await Article.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { content: { $regex: q, $options: 'i' } }
            ]
        }).select('title category');
        const courses = await Course.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ]
        }).select('title category');
        res.json({ articles, courses });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Filter search results
router.get('/resources/filter', async (req, res) => {
    // Explanation: Filters resources by category, date, and limit
    try {
        const { category, date, limit } = req.query;
        const query = {};
        if (category) query.category = category;
        if (date) query.createdAt = { $gte: new Date(date) };
        
        const articles = await Article.find(query)
            .select('title category createdAt')
            .limit(parseInt(limit) || 10);
        const courses = await Course.find(query)
            .select('title category createdAt')
            .limit(parseInt(limit) || 10);
        res.json({ articles, courses });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;