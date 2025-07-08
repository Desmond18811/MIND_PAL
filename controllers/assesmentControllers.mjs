// controllers/assessmentController.mjs
import Assessment from "../models/Assesments.mjs";
import QuestionBank from '../models/QuestionBank.mjs';
import User from '../models/User.mjs';
import mongoose from 'mongoose';

class AssessmentController {
    // Get all questions (no randomization)
    async getAssessmentQuestions(req, res) {
        try {
            if (!req.user || !req.user._id) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Authentication required'
                });
            }

            console.log('Connecting to database...'); // Debug log
            console.log('Database name:', mongoose.connection.name); // Debug log

            const userId = req.user._id;

            // Check if assessment exists
            const existingAssessment = await Assessment.findOne({ userId });
            if (existingAssessment) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Assessment already completed',
                    data: { completedAt: existingAssessment.completedAt }
                });
            }

            // Debug: Check total questions in database
            const totalQuestions = await QuestionBank.countDocuments();
            console.log('Total questions in DB:', totalQuestions); // Debug log

            // Get all active questions
            const questions = await QuestionBank.find({ isActive: true }).lean();
            console.log('Active questions found:', questions.length); // Debug log
            console.log('Sample question:', questions[0]); // Debug log

            if (!questions.length) {
                // Additional debug - check if any inactive questions exist
                const inactiveCount = await QuestionBank.countDocuments({ isActive: false });
                console.log('Inactive questions count:', inactiveCount); // Debug log

                return res.status(404).json({
                    status: 'error',
                    message: 'No questions available',
                    debugInfo: {
                        totalQuestions,
                        inactiveCount
                    }
                });
            }

            res.status(200).json({
                status: 'success',
                data: {
                    questions,
                    totalQuestions: questions.length,
                    estimatedTime: Math.ceil(questions.length * 0.5)
                }
            });

        } catch (err) {
            console.error('Error in getAssessmentQuestions:', err);
            res.status(500).json({
                status: 'error',
                message: 'Failed to get assessment questions',
                error: err.message
            });
        }
    }

    // Submit completed assessment
    async submitAssessment(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            if (!req.user || !req.user._id) {
                await session.abortTransaction();
                session.endSession();
                return res.status(401).json({
                    status: 'error',
                    message: 'Authentication required'
                });
            }

            const userId = req.user._id;
            const {responses} = req.body;

            // Validate responses
            if (!Array.isArray(responses)) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    status: 'error',
                    message: 'Responses must be an array'
                });
            }

            // Check if assessment exists
            const existingAssessment = await Assessment.findOne({ userId }).session(session);
            if (existingAssessment) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    status: 'error',
                    message: 'Assessment already completed'
                });
            }

            // Get all questions to validate responses
            const questions = await QuestionBank.find({
                _id: { $in: responses.map(r => r.questionId) }
            }).session(session);

            // Validate each response
            for (const response of responses) {
                const question = questions.find(q => q._id.equals(response.questionId));
                if (!question) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({
                        status: 'error',
                        message: `Invalid question ID: ${response.questionId}`
                    });
                }

                // Validate answer based on input type
                switch (question.inputType) {
                    case 'select':
                    case 'scale':
                        if (!question.options.some(opt => opt.value === response.answer)) {
                            await session.abortTransaction();
                            session.endSession();
                            return res.status(400).json({
                                status: 'error',
                                message: `Invalid answer for question: ${question.questionText}`
                            });
                        }
                        break;
                    case 'text':
                    case 'number':
                        if (typeof response.answer !== 'string' || !response.answer.trim()) {
                            await session.abortTransaction();
                            session.endSession();
                            return res.status(400).json({
                                status: 'error',
                                message: `Text answer required for: ${question.questionText}`
                            });
                        }
                        break;
                }
            }

            // Create assessment with formatted responses
            const formattedResponses = responses.map(response => {
                const question = questions.find(q => q._id.equals(response.questionId));
                return {
                    questionId: response.questionId,
                    answer: response.answer,
                    questionText: question.questionText,
                    inputType: question.inputType
                };
            });

            const assessment = new Assessment({
                userId,
                responses: formattedResponses
            });

            await assessment.save({ session });

            // Update user's onboarding status
            await User.findByIdAndUpdate(
                userId,
                {
                    $set: {
                        onboardingCompleted: true,
                        assessmentCompletedAt: new Date()
                    }
                },
                { session, new: true }
            );

            await session.commitTransaction();
            session.endSession();

            res.status(201).json({
                status: 'success',
                message: 'Assessment completed successfully',
                data: {
                    assessmentId: assessment._id,
                    recommendations: await this.generateRecommendations(assessment)
                }
            });

        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            console.error('Error in submitAssessment:', err);
            res.status(500).json({
                status: 'error',
                message: 'Failed to submit assessment',
                error: err.message
            });
        }
    }

    async generateRecommendations(assessment) {
        const recommendations = [];
        const responses = assessment.responses;

        // Helper to find answer by question text
        const getAnswer = (questionText) => {
            const response = responses.find(r => r.questionText === questionText);
            return response ? response.answer : null;
        };

        // Sleep quality recommendation
        const sleepAnswer = getAnswer("How would you rate your sleep quality?");
        if (sleepAnswer && ['fair', 'poor'].includes(sleepAnswer)) {
            recommendations.push({
                category: 'sleep',
                title: 'Improve Sleep Quality',
                description: 'Your sleep quality needs improvement',
                priority: 'high',
                actions: [
                    'Maintain consistent sleep schedule',
                    'Avoid screens before bedtime',
                    'Create a relaxing bedtime routine'
                ]
            });
        }

        // Stress level recommendation
        const stressAnswer = getAnswer("How would you rate your stress level? (1-5)");
        if (stressAnswer && parseInt(stressAnswer) >= 4) {
            recommendations.push({
                category: 'stress',
                title: 'Reduce Stress',
                description: 'Your stress levels are high',
                priority: 'high',
                actions: [
                    'Practice deep breathing exercises',
                    'Try 10-minute daily meditation',
                    'Take regular breaks during work'
                ]
            });
        }

        // Mood recommendation
        const moodAnswer = getAnswer("How would you describe your mood?");
        if (moodAnswer === 'sad') {
            recommendations.push({
                category: 'mood',
                title: 'Improve Mood',
                description: 'You reported feeling sad',
                priority: 'medium',
                actions: [
                    'Connect with friends or family',
                    'Engage in physical activity',
                    'Consider talking to a professional'
                ]
            });
        }

        return recommendations;
    }
}

export default new AssessmentController();
