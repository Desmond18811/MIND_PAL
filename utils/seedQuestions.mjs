
// utils/seedQuestions.mjs
import QuestionBank from '../models/QuestionBank.mjs';
import mongoose from 'mongoose';
import { DB_URI } from '../config/env.js'; // Import DB_URI from env.js


const questions = [
    {
        questionText: "What's your health goal for today?",
        category: "health",
        isCore: true,
        inputType: 'select',
        options: [
            { value: "reduce-stress", label: "I wanna reduce stress" },
            { value: "try-therapy", label: "I wanna try therapy" },
            { value: "cope-trauma", label: "I want to cope with trauma" },
            { value: "self-improve", label: "I want to be a better person" }
        ],
        isActive: true
    },
    {
        questionText: "What's your official gender?",
        category: "demographics",
        isCore: true,
        inputType: 'select',
        options: [
            { value: "male", label: "I am Male" },
            { value: "female", label: "I am Female" }
        ],
        isActive: true
    },
    {
        questionText: "What's your age?",
        category: "demographics",
        isCore: true,
        inputType: 'text',
        isActive: true
    },
    {
        questionText: "What's your weight?",
        category: "demographics",
        isCore: true,
        inputType: 'text',
        isActive: true
    },
    {
        questionText: "How would you describe your mood?",
        category: "mental-health",
        isCore: true,
        inputType: 'select',
        options: [
            { value: "neutral", label: "I feel Neutral" },
            { value: "happy", label: "I feel Happy" },
            { value: "sad", label: "I feel Sad" }
        ],
        isActive: true
    },
    {
        questionText: "Have you sought professional help before?",
        category: "mental-health",
        isCore: true,
        inputType: 'select',
        options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" }
        ],
        isActive: true
    },
    {
        questionText: "How would you rate your sleep quality?",
        category: "lifestyle",
        isCore: true,
        inputType: 'select',
        options: [
            { value: "excellent", label: "Excellent" },
            { value: "good", label: "Good" },
            { value: "fair", label: "Fair" },
            { value: "poor", label: "Poor" }
        ],
        isActive: true
    },
    {
        questionText: "Are you experiencing any physical distress?",
        category: "health",
        isCore: false,
        inputType: 'select',
        options: [
            { value: "no-pain", label: "No Physical Pain at All" },
            { value: "pain", label: "Pain in different places" }
        ],
        isActive: true
    },
    {
        questionText: "Are you taking any medications?",
        category: "health",
        isCore: false,
        inputType: 'select',
        options: [
            { value: "none", label: "I'm not taking any" },
            { value: "prescribed", label: "Prescribed" },
            { value: "otc", label: "Over-the-Counter" }
        ],
        isActive: true
    },
    {
        questionText: "How would you rate your stress level?",
        category: "mental-health",
        isCore: false,
        inputType: 'scale',
        options: [
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4", label: "4" },
            { value: "5", label: "5" }
        ],
        isActive: true
    }
];


const seedQuestions = async () => {
    try {
        if (!DB_URI) {
            throw new Error(
                "DB_URI is undefined. Please ensure .env.development.local is configured with MONGODB_URI."
            );
        }

        await mongoose.connect(DB_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
            socketTimeoutMS: 45000,
        });
        console.log('Connected to database for seeding');

        // Clear existing questions
        await QuestionBank.deleteMany({});

        // Insert new questions
        await QuestionBank.insertMany(questions);

        console.log('✅ Questions seeded successfully');
        const count = await QuestionBank.countDocuments();
        console.log(`Total questions in database: ${count}`);
    } catch (error) {
        console.error('❌ Error seeding questions:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

seedQuestions().catch(err => console.error(err));

