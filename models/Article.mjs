
// Import Mongoose for MongoDB schema creation
import mongoose from 'mongoose';

// Define the Article schema
const articleSchema = new mongoose.Schema({
    // Title of the article (e.g., "Mindfulness Basics")
    title: { type: String, required: true },
    // Content of the article (e.g., HTML or markdown text)
    content: { type: String, required: true },
    // Category (e.g., "Mindfulness", "Stress Relief")
    category: { type: String, required: true },
    // Date the article was created
    createdAt: { type: Date, default: Date.now },
    // Tags for search and filtering (e.g., ["meditation", "beginner"])
    tags: [String]
});

// Create and export the Article model
export default mongoose.model('Article', articleSchema);