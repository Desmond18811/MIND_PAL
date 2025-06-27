
// Import Mongoose for MongoDB schema creation
import mongoose from 'mongoose';

// Define the Course schema
const courseSchema = new mongoose.Schema({
    // Title of the course (e.g., "Introduction to Meditation")
    title: { type: String, required: true },
    // Description of the course
    description: { type: String, required: true },
    // Category (e.g., "Meditation", "Yoga")
    category: { type: String, required: true },
    // List of module IDs or content references
    modules: [{ type: String }],
    // Date the course was created
    createdAt: { type: Date, default: Date.now },
    // Tags for search and filtering
    tags: [String],
    // Users who have completed the course
    completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// Create and export the Course model
export default mongoose.model('Course', courseSchema);
