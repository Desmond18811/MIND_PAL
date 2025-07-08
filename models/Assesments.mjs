// models/Assessment.mjs
import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    responses: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'QuestionBank',
            required: true
        },
        answer: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        questionText: {
            type: String,
            required: true
        },
        inputType: {
            type: String,
            required: true
        }
    }],
    completedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('Assessment', assessmentSchema);




// import mongoose from 'mongoose';
//
// const assessmentSchema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     age: {
//         type: Number,
//         required: true
//     },
//     gender: {
//         type: String,
//         required: true
//     },
//     weight: {
//         type: Number,
//         required: true
//     },
//     healthGoals: {
//         type: [String],
//         required: true
//     },
//     sleepQuality: {
//         type: Number,
//         required: true
//     },
//     stressLevel: {
//         type: Number,
//         required: true
//     },
//     timestamp: {
//         type: Date,
//         default: Date.now
//     }
// }, {
//     timestamps: true
// });
//
// const Assessment = mongoose.model('Assessment', assessmentSchema);
//
// export default Assessment;