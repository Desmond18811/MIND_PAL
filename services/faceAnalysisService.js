/**
 * Facial Analysis Service ("Hogan's Face")
 * Analyzes facial expressions to detect mood and stress levels using Vision AI
 */

import OpenAI from 'openai';
import { getCurrentProvider, AI_PROVIDERS } from '../agents/aiAdapter.js';

let openaiClient = null;

if (process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Analyze facial expression from image buffer
 * @param {Buffer} imageBuffer - Image data buffer
 * @param {string} mimeType - Image mime type (image/jpeg, image/png)
 * @returns {Object} Analysis result
 */
export async function analyzeFacialExpression(imageBuffer, mimeType = 'image/jpeg') {
    if (!openaiClient) {
        return getMockFaceAnalysis();
    }

    try {
        const base64Image = imageBuffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        const response = await openaiClient.chat.completions.create({
            model: 'gpt-4o-mini', // or gpt-4-turbo/vision
            messages: [
                {
                    role: 'system',
                    content: `You are Doctor Freud AI (internal codename: Hogan's Face), an expert in facial emotional analysis. 
          Analyze the face in this image for emotional indicators and stress signs. 
          Return ONLY valid JSON with this structure:
          {
            "primaryEmotion": "happy/sad/angry/surprised/fearful/disgusted/neutral",
            "stressLevel": <1-10 string>,
            "confidence": <0-1 float>,
            "indicators": ["indicator1", "indicator2"],
            "fatigueLevel": "low/medium/high",
            "eyeContact": "direct/avoidant",
            "medicalNote": "Brief observation for the user"
          }`
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: "Analyze this facial expression." },
                        { type: 'image_url', image_url: { url: dataUrl } }
                    ]
                }
            ],
            max_tokens: 300,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content);
        return {
            success: true,
            data: result,
            timestamp: new Date()
        };

    } catch (error) {
        console.error('Facial analysis error:', error);
        return getMockFaceAnalysis();
    }
}

/**
 * Get mock analysis for testing or fallback
 */
function getMockFaceAnalysis() {
    const emotions = ['happy', 'neutral', 'stressed', 'tired', 'anxious'];
    const selected = emotions[Math.floor(Math.random() * emotions.length)];

    let stressLevel = 3;
    if (selected === 'stressed') stressLevel = 8;
    if (selected === 'anxious') stressLevel = 7;
    if (selected === 'happy') stressLevel = 2;

    return {
        success: true,
        mock: true,
        data: {
            primaryEmotion: selected,
            stressLevel: stressLevel,
            confidence: 0.88,
            indicators: ['Use of mock data', 'Simulated micro-expressions'],
            fatigueLevel: selected === 'tired' ? 'high' : 'low',
            eyeContact: 'direct',
            medicalNote: "This is a simulated analysis. In production, AI Vision would analyze your actual expression."
        },
        timestamp: new Date()
    };
}

export default { analyzeFacialExpression };
