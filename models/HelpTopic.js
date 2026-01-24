
// Import Mongoose for MongoDB schema creation
import mongoose from 'mongoose';

// Define the HelpTopic schema
const helpTopicSchema = new mongoose.Schema({
    // Title of the help topic (e.g., "How to Log Mood")
    title: { type: String, required: true },
    // Content of the help topic (e.g., HTML or markdown)
    content: { type: String, required: true },
    // Category (e.g., "App Usage", "Account Issues")
    category: { type: String, required: true },
    // Date the topic was created
    createdAt: { type: Date, default: Date.now }
});

// Create and export the HelpTopic model
export default mongoose.model('HelpTopic', helpTopicSchema);
