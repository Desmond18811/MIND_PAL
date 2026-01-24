// models/QuestionBank.js
import mongoose from 'mongoose';

const questionBankSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['demographics', 'health', 'lifestyle', 'mental-health', 'fitness']
    },
    inputType: {
        type: String,
        required: true,
        enum: ['text', 'select', 'scale', 'multi-select'],
        default: 'text'
    },
    options: [{
        value: String,
        label: String
    }],
    isCore: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    weight: {
        type: Number,
        default: 1
    }
}, { timestamps: true });
// models/QuestionBank.js
export default mongoose.model('QuestionBank', questionBankSchema, 'questionbank');