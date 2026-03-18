/**
 * Dataset Service - Export training data and push to Hugging Face
 * Converts user conversation sessions into JSONL training pairs
 * for fine-tuning Serenity on Hugging Face
 */

import ChatSession from '../models/ChatSession.js';
import { SERENITY_SYSTEM_PROMPT } from '../agents/SerenityPrompts.js';
import axios from 'axios';

/**
 * Export conversation sessions as JSONL training data
 * Format: OpenAI-compatible chat format (also works for Llama fine-tuning)
 * Each line: {"messages": [{"role": "system", ...}, {"role": "user", ...}, {"role": "assistant", ...}]}
 * 
 * @param {Object} options - Export options
 * @param {number} options.minMessages - Minimum messages per session (default: 4)
 * @param {number} options.maxSessions - Maximum sessions to export (default: 1000)
 * @param {boolean} options.anonymize - Strip user IDs (default: true)
 * @returns {Object} { success, data (JSONL string), stats }
 */
export async function exportTrainingData(options = {}) {
    const {
        minMessages = 4,
        maxSessions = 1000,
        anonymize = true
    } = options;

    try {
        // Find sessions with enough messages for meaningful training
        const sessions = await ChatSession.find({
            'messages.3': { $exists: true } // At least 4 messages
        })
            .sort({ createdAt: -1 })
            .limit(maxSessions)
            .lean();

        if (sessions.length === 0) {
            return {
                success: false,
                message: 'No conversation sessions found with enough messages'
            };
        }

        const trainingExamples = [];
        let totalPairs = 0;

        for (const session of sessions) {
            // Group messages into user-assistant pairs
            const messages = session.messages || [];

            // Build training conversation with system prompt
            const trainingMessages = [
                { role: 'system', content: SERENITY_SYSTEM_PROMPT }
            ];

            for (let i = 0; i < messages.length; i++) {
                const msg = messages[i];

                // Map sender to role
                const role = msg.sender === 'user' ? 'user' : 'assistant';

                // Skip empty messages
                if (!msg.content || msg.content.trim() === '') continue;

                trainingMessages.push({
                    role,
                    content: msg.content.trim()
                });
            }

            // Only include if we have at least one user-assistant exchange
            const hasUserMsg = trainingMessages.some(m => m.role === 'user');
            const hasAssistantMsg = trainingMessages.some(m => m.role === 'assistant');

            if (hasUserMsg && hasAssistantMsg && trainingMessages.length >= minMessages) {
                const example = { messages: trainingMessages };

                // Add metadata (not used in training, but useful for filtering)
                if (!anonymize) {
                    example._metadata = {
                        sessionId: session._id.toString(),
                        sessionType: session.sessionType,
                        createdAt: session.createdAt
                    };
                }

                trainingExamples.push(example);
                totalPairs++;
            }
        }

        // Convert to JSONL format (one JSON object per line)
        const jsonlData = trainingExamples
            .map(example => JSON.stringify(example))
            .join('\n');

        return {
            success: true,
            data: jsonlData,
            stats: {
                totalSessions: sessions.length,
                validExamples: totalPairs,
                totalMessages: trainingExamples.reduce((sum, ex) => sum + ex.messages.length, 0),
                format: 'jsonl',
                note: 'Compatible with OpenAI fine-tuning format and Llama training'
            }
        };

    } catch (error) {
        console.error('Dataset export error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Push a dataset file to a Hugging Face repository
 * Uses the HF Hub API to upload files
 * 
 * @param {string} jsonlData - JSONL string data
 * @param {Object} options - Push options
 * @returns {Object} { success, url }
 */
export async function pushToHuggingFace(jsonlData, options = {}) {
    const {
        repoId = process.env.HUGGINGFACE_REPO_ID,
        filename = `training_data_${new Date().toISOString().split('T')[0]}.jsonl`,
        commitMessage = 'Add training data from MindPal conversations'
    } = options;

    const token = process.env.HUGGINGFACE_API_KEY;

    if (!token) {
        return { success: false, error: 'HUGGINGFACE_API_KEY not configured' };
    }

    if (!repoId) {
        return { success: false, error: 'HUGGINGFACE_REPO_ID not configured' };
    }

    try {
        // Convert data to base64 for the API
        const contentBase64 = Buffer.from(jsonlData, 'utf-8').toString('base64');

        // Use the HF Hub API to upload
        const response = await axios({
            method: 'PUT',
            url: `https://huggingface.co/api/models/${repoId}/commit/main`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: {
                summary: commitMessage,
                files: [{
                    path: `data/${filename}`,
                    content: contentBase64,
                    encoding: 'base64'
                }]
            }
        });

        return {
            success: true,
            url: `https://huggingface.co/${repoId}/blob/main/data/${filename}`,
            commitId: response.data?.commitId
        };

    } catch (error) {
        console.error('HF push error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.error || error.message
        };
    }
}

/**
 * Get dataset statistics without exporting full data
 */
export async function getDatasetStats() {
    try {
        const totalSessions = await ChatSession.countDocuments();
        const trainableSessions = await ChatSession.countDocuments({
            'messages.3': { $exists: true }
        });

        const pipeline = await ChatSession.aggregate([
            { $project: { messageCount: { $size: '$messages' } } },
            {
                $group: {
                    _id: null,
                    totalMessages: { $sum: '$messageCount' },
                    avgMessages: { $avg: '$messageCount' }
                }
            }
        ]);

        const stats = pipeline[0] || { totalMessages: 0, avgMessages: 0 };

        return {
            success: true,
            stats: {
                totalSessions,
                trainableSessions,
                totalMessages: stats.totalMessages,
                avgMessagesPerSession: Math.round(stats.avgMessages || 0),
                estimatedTrainingPairs: trainableSessions
            }
        };
    } catch (error) {
        console.error('Dataset stats error:', error);
        return { success: false, error: error.message };
    }
}

export default { exportTrainingData, pushToHuggingFace, getDatasetStats };
