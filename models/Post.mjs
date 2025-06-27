
// Import Mongoose for MongoDB schema creation
import mongoose from 'mongoose';

// Define the Post schema
const postSchema = new mongoose.Schema({
    // ID of the user who created the post
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Content of the post (e.g., text or markdown)
    content: { type: String, required: true },
    // Date the post was created
    createdAt: { type: Date, default: Date.now },
    // Date the post was last updated
    updatedAt: { type: Date },
    // Likes or reactions to the post
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Comments on the post
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: String,
        createdAt: { type: Date, default: Date.now }
    }]
});

// Create and export the Post model
export default mongoose.model('Post', postSchema);
