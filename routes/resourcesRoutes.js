/**
 * Resource Routes - API for Mindful Content
 */

import express from 'express';
import Resource from '../models/Resource.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

/**
 * GET /api/resources
 * Get resources with filtering and search
 */
router.get('/', async (req, res) => {
    try {
        const {
            type,
            category,
            search,
            page = 1,
            limit = 20,
            source
        } = req.query;

        const query = { isActive: true };

        if (type) query.type = type;
        if (category) query.category = category;
        if (source) query['source.name'] = source;

        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }

        const resources = await Resource.find(query)
            .sort(search ? { score: { $meta: "textScore" } } : { createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        // Get categories count for filters (optional optimization: cache this)
        const total = await Resource.countDocuments(query);

        res.json({
            status: 'success',
            data: resources,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch resources' });
    }
});

/**
 * GET /api/resources/daily-pick
 * Get a specific resource for daily recommendation
 */
router.get('/daily-pick', async (req, res) => {
    try {
        // Basic random pick for now, could be personalized later via ML
        const count = await Resource.countDocuments({ isActive: true });
        const random = Math.floor(Math.random() * count);

        const resource = await Resource.findOne({ isActive: true })
            .skip(random)
            .lean();

        res.json({
            status: 'success',
            data: resource
        });

    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to get daily pick' });
    }
});

/**
 * GET /api/resources/:id/speak
 * Read article aloud using Serenity TTS
 */
router.get('/:id/speak', async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        if (resource.type !== 'article') {
            return res.status(400).json({ message: 'Only articles can be read aloud' });
        }

        // Lazy load voice service to avoid circular deps if any
        const { voiceService } = await import('../services/voiceService.js');
        const { getNAMIArticleContent } = await import('../scrappers/namiScraper.js');

        // If description is short, try to fetch full content on-the-fly (caching would be better)
        let textToRead = resource.description;
        if (resource.source?.name === 'NAMI') {
            const fullContent = await getNAMIArticleContent(resource.url);
            if (fullContent) textToRead = fullContent;
        }

        if (!textToRead) return res.status(400).json({ message: 'No content to read' });

        const audioResult = await voiceService.synthesizeLongText(textToRead, {
            voice: 'en-US-Neural2-F',
            speakingRate: 1.0
        });

        if (audioResult.success) {
            res.json({
                status: 'success',
                data: {
                    audioContent: audioResult.audioContent,
                    contentType: audioResult.contentType,
                    duration: audioResult.duration
                }
            });
        } else {
            res.status(500).json({ message: 'TTS generation failed' });
        }

    } catch (error) {
        console.error('Speak error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to generate audio' });
    }
});

/**
 * GET /api/resources/:id/play
 * Get playback info (Spotify deep link, Stream URL)
 */
router.get('/:id/play', async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        const playbackInfo = {
            type: 'web', // default
            url: resource.url
        };

        // Spotify detection
        if (resource.url.includes('spotify.com')) {
            playbackInfo.type = 'spotify';
            // Convert normal URL to embed/URI if needed
            // User can open this URI to jump to app: spotify:track:123
            if (resource.url.includes('/track/')) {
                const id = resource.url.split('/track/')[1].split('?')[0];
                playbackInfo.spotifyUri = `spotify:track:${id}`;
                playbackInfo.embedUrl = `https://open.spotify.com/embed/track/${id}`;
            } else if (resource.url.includes('/episode/')) {
                const id = resource.url.split('/episode/')[1].split('?')[0];
                playbackInfo.spotifyUri = `spotify:episode:${id}`;
                playbackInfo.embedUrl = `https://open.spotify.com/embed/episode/${id}`;
            }
        } else if (resource.url.includes('youtube.com') || resource.url.includes('youtu.be')) {
            playbackInfo.type = 'youtube';
            playbackInfo.embedUrl = resource.url.replace('watch?v=', 'embed/');
        }

        res.json({
            status: 'success',
            data: playbackInfo
        });

    } catch (error) {
        res.status(500).json({ status: 'error' });
    }
});

/**
 * POST /api/resources/:id/view
 * Track view count
 */
router.post('/:id/view', async (req, res) => {
    try {
        await Resource.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        res.json({ status: 'success' });
    } catch (error) {
        res.status(500).json({ status: 'error' });
    }
});

export default router;