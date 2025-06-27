
// Import Mongoose for MongoDB schema creation
import mongoose from 'mongoose';

// Define the ChatSession schema
const chatSessionSchema = new mongoose.Schema({
    // ID of the user associated with the session
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Array of messages in the session
    messages: [{
        // Sender of the message ('user' or 'bot')
        sender: { type: String, required: true },
        // Content of the message
        content: { type: String, required: true },
        // Timestamp of the message
        timestamp: { type: Date, default: Date.now }
    }],
    // Date the session was created
    createdAt: { type: Date, default: Date.now }
});

// Create and export the ChatSession model
export default mongoose.model('ChatSession', chatSessionSchema);
