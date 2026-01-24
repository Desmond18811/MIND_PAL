/**
 * Socket.io Event Handlers for Serenity AI
 * Handles real-time chat, voice, and permission events
 */

import { createSerenityAgent } from '../agents/SerenityAgent.js';
import ChatSession from '../models/ChatSession.js';
import DataPermission from '../models/DataPermission.js';
import { voiceService } from '../services/voiceService.js';
import jwt from 'jsonwebtoken';

// Store active agent connections
const activeAgents = new Map();

/**
 * Authenticate socket connection using JWT
 */
export function authenticateSocket(socket, next) {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return next(new Error('Authentication required'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        socket.user = decoded;
        next();
    } catch (err) {
        next(new Error('Invalid token'));
    }
}

/**
 * Initialize Socket.io handlers
 * @param {Server} io - Socket.io server instance
 */
export function initializeSocketHandlers(io) {
    // Authentication middleware
    io.use(authenticateSocket);

    io.on('connection', async (socket) => {
        console.log(`🔌 User connected: ${socket.userId}`);

        try {
            // Create or retrieve Serenity agent for this user
            const agent = await createSerenityAgent(socket.userId);
            activeAgents.set(socket.userId, agent);

            // Join user to their personal room
            socket.join(`user:${socket.userId}`);

            // Send welcome event with agent status
            const status = agent.getStatus();
            socket.emit('serenity:connected', {
                message: status.userName ? `Welcome back, ${status.userName}!` : 'Serenity is ready to chat',
                status,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Agent initialization error:', error);
            socket.emit('serenity:error', { message: 'Failed to initialize Serenity' });
        }

        // ========== CHAT EVENTS ==========

        /**
         * Handle incoming chat message
         */
        socket.on('chat:message', async (data) => {
            const { message, sessionId, type = 'text', generateVoice = false } = data;
            const agent = activeAgents.get(socket.userId);

            if (!agent) {
                return socket.emit('serenity:error', { message: 'Agent not initialized' });
            }

            if (!message || message.trim() === '') {
                return socket.emit('serenity:error', { message: 'Message cannot be empty' });
            }

            // Emit typing indicator
            socket.emit('serenity:typing', { isTyping: true });

            try {
                // Handle message through agent with voice option
                const response = await agent.handleMessage(message, sessionId, type, { generateVoice });

                // Stop typing indicator
                socket.emit('serenity:typing', { isTyping: false });

                // Send response
                socket.emit('chat:response', {
                    sessionId: response.sessionId,
                    message: response.response,
                    sentiment: response.sentiment,
                    audio: response.audio, // Audio data if voice was requested
                    topics: response.topics,
                    timestamp: response.timestamp || new Date(),
                    provider: response.provider
                });

            } catch (error) {
                console.error('Chat message error:', error);
                socket.emit('serenity:typing', { isTyping: false });
                socket.emit('serenity:error', {
                    message: 'Sorry, I had trouble processing that. Please try again.'
                });
            }
        });

        /**
         * Handle typing indicator from user
         */
        socket.on('chat:typing', (data) => {
            // Could be used for presence features
            socket.to(`user:${socket.userId}`).emit('user:typing', data);
        });

        /**
         * Start a new chat session
         */
        socket.on('chat:newSession', async () => {
            try {
                const session = new ChatSession({
                    userId: socket.userId,
                    sessionType: 'text',
                    messages: []
                });
                await session.save();

                socket.emit('chat:sessionCreated', {
                    sessionId: session._id,
                    timestamp: new Date()
                });
            } catch (error) {
                socket.emit('serenity:error', { message: 'Failed to create session' });
            }
        });

        /**
         * Get chat history
         */
        socket.on('chat:getHistory', async (data) => {
            const { sessionId, limit = 50 } = data;
            const agent = activeAgents.get(socket.userId);

            if (!agent) {
                return socket.emit('serenity:error', { message: 'Agent not initialized' });
            }

            try {
                const result = await agent.getConversationHistory(sessionId, limit);
                socket.emit('chat:history', result);
            } catch (error) {
                socket.emit('serenity:error', { message: 'Failed to get history' });
            }
        });

        // ========== VOICE EVENTS ==========

        /**
         * Start voice recording session
         */
        socket.on('voice:start', async () => {
            socket.emit('voice:ready', {
                message: 'Ready to receive voice data',
                timestamp: new Date()
            });
        });

        /**
         * Receive voice data chunk (for streaming)
         */
        socket.on('voice:data', async (data) => {
            // Voice data handling - will be processed by voice service
            // This is a placeholder for streaming audio processing
            socket.emit('voice:received', {
                bytesReceived: data.length,
                timestamp: new Date()
            });
        });

        /**
         * End voice recording and process
         */
        socket.on('voice:end', async (data) => {
            const { audioData, sessionId, language = 'en-US' } = data;
            const agent = activeAgents.get(socket.userId);

            if (!audioData) {
                return socket.emit('serenity:error', { message: 'No audio data received' });
            }

            socket.emit('serenity:typing', { isTyping: true });

            try {
                // Convert base64 to buffer
                const buffer = Buffer.from(audioData, 'base64');

                // Transcribe audio
                const transcription = await voiceService.transcribeAudio(buffer, { languageCode: language });

                if (!transcription.success) {
                    throw new Error('Transcription failed');
                }

                // Process transcribed text through agent
                const response = await agent.handleMessage(
                    transcription.text,
                    sessionId,
                    'voice',
                    { generateVoice: true } // Always generate voice response for voice input
                );

                socket.emit('serenity:typing', { isTyping: false });

                // Send back transcription and audio response
                socket.emit('voice:response', {
                    sessionId: response.sessionId,
                    transcription: transcription.text,
                    message: response.response, // Text response
                    audio: response.audio,      // Audio response
                    sentiment: response.sentiment,
                    timestamp: new Date()
                });

            } catch (error) {
                console.error('Voice processing error:', error);
                socket.emit('serenity:typing', { isTyping: false });
                socket.emit('serenity:error', { message: 'Voice processing failed' });
            }
        });

        // ========== PERMISSION EVENTS ==========

        /**
         * Get current permissions
         */
        socket.on('permission:get', async () => {
            try {
                const permission = await DataPermission.getOrCreate(socket.userId);
                socket.emit('permission:current', {
                    permissions: permission.permissions,
                    grantedAt: permission.grantedAt
                });
            } catch (error) {
                socket.emit('serenity:error', { message: 'Failed to get permissions' });
            }
        });

        /**
         * Update permissions
         */
        socket.on('permission:update', async (data) => {
            const { dataType, granted } = data;
            const agent = activeAgents.get(socket.userId);

            try {
                const permission = await DataPermission.getOrCreate(socket.userId);

                if (granted) {
                    permission.grantPermission(dataType, {
                        ipAddress: socket.handshake.address,
                        userAgent: socket.handshake.headers['user-agent']
                    });
                } else {
                    permission.revokePermission(dataType, {
                        ipAddress: socket.handshake.address,
                        userAgent: socket.handshake.headers['user-agent']
                    });
                }

                await permission.save();

                // Update agent permissions and refresh context
                if (agent) {
                    await agent.updatePermissions({ [dataType]: granted });
                }

                socket.emit('permission:updated', {
                    dataType,
                    granted,
                    timestamp: new Date()
                });

                // If permission granted, offer insights immediately
                if (granted) {
                    const insights = await agent.generateUserInsights();
                    if (insights.success && insights.insights) {
                        socket.emit('chat:response', {
                            message: `Thank you for trusting me! I've analyzed your data. ${insights.insights.overallMood}`,
                            timestamp: new Date()
                        });
                    }
                }

            } catch (error) {
                socket.emit('serenity:error', { message: 'Failed to update permissions' });
            }
        });

        /**
         * Request permission for analysis (triggered by Serenity)
         */
        socket.on('permission:request', async (data) => {
            const { dataType } = data;
            const agent = activeAgents.get(socket.userId);

            if (agent) {
                const request = agent.requestPermission(dataType);

                // Update last requested timestamp
                const permission = await DataPermission.getOrCreate(socket.userId);
                permission.lastRequestedAt = new Date();
                await permission.save();

                socket.emit('permission:requested', request);
            }
        });

        // ========== INSIGHTS EVENTS ==========

        /**
         * Request personalized insights
         */
        socket.on('insights:generate', async () => {
            const agent = activeAgents.get(socket.userId);

            if (!agent) {
                return socket.emit('serenity:error', { message: 'Agent not initialized' });
            }

            socket.emit('serenity:typing', { isTyping: true });

            try {
                const result = await agent.generateUserInsights();
                socket.emit('serenity:typing', { isTyping: false });

                if (result.needsPermission) {
                    socket.emit('permission:needed', {
                        message: result.message
                    });
                } else {
                    socket.emit('insights:generated', result);
                }
            } catch (error) {
                socket.emit('serenity:typing', { isTyping: false });
                socket.emit('serenity:error', { message: 'Failed to generate insights' });
            }
        });

        /**
         * Get activity suggestions
         */
        socket.on('suggestions:get', async (data) => {
            const { currentMood, timeOfDay } = data;
            const agent = activeAgents.get(socket.userId);

            if (!agent) {
                return socket.emit('serenity:error', { message: 'Agent not initialized' });
            }

            try {
                const suggestions = await agent.suggestActivities(currentMood, timeOfDay);
                socket.emit('suggestions:list', { suggestions });
            } catch (error) {
                socket.emit('serenity:error', { message: 'Failed to get suggestions' });
            }
        });

        // ========== DISCONNECT ==========

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${socket.userId}`);
            activeAgents.delete(socket.userId);
        });

    });

    return io;
}

export default { initializeSocketHandlers, authenticateSocket };
