import MusicTrack from '../models/MusicTrack.js';
import axios from 'axios';
import mongoose from 'mongoose';

// Epidemic Sound API configuration
const EPIDEMIC_SOUND_API = {
    BASE_URL: 'https://api.epidemicsound.com/v2',
    API_KEY: process.env.EPIDEMIC_SOUND_API_KEY
};

// Fetch and store tracks from Epidemic Sound
export const syncEpidemicSoundTracks = async (req, res) => {
    try {
        // Fetch tracks from Epidemic Sound API
        const response = await axios.get(`${EPIDEMIC_SOUND_API.BASE_URL}/tracks`, {
            headers: {
                'Authorization': `Bearer ${EPIDEMIC_SOUND_API.API_KEY}`
            },
            params: {
                limit: 50,
                offset: 0,
                mood: 'calm,relaxing,sleep'
            }
        });

        const tracks = response.data.data;
        const savedTracks = [];

        // Save or update tracks in a database
        for (const track of tracks) {
            const savedTrack = await MusicTrack.findOneAndUpdate(
                { epidemicSoundId: track.id },
                {
                    title: track.title,
                    artist: track.artists.map(a => a.name).join(', '),
                    album: track.album?.title || 'Single',
                    duration: track.duration,
                    genre: track.genre,
                    mood: track.mood,
                    bpm: track.bpm,
                    tags: track.tags,
                    audioUrl: track.previewUrl,
                    coverArtUrl: track.coverArtUrl,
                    isPremium: true,
                    licenseInfo: 'Epidemic Sound Standard License'
                },
                { upsert: true, new: true }
            );
            savedTracks.push(savedTrack);
        }

        res.json({
            message: `Successfully synced ${savedTracks.length} tracks`,
            tracks: savedTracks
        });
    } catch (error) {
        console.error('Error syncing Epidemic Sound tracks:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get music recommendations
export const getMusicRecommendations = async (req, res) => {
    try {
        const { mood, genre, bpmMin, bpmMax, limit = 10 } = req.query;
        const userId = req.user._id;

        let query = {};
        if (mood) query.mood = mood;
        if (genre) query.genre = genre;
        if (bpmMin || bpmMax) {
            query.bpm = {};
            if (bpmMin) query.bpm.$gte = parseInt(bpmMin);
            if (bpmMax) query.bpm.$lte = parseInt(bpmMax);
        }

        // Get user's favorite tracks to exclude
        const userFavorites = await UserFavoriteMusic.find({ userId })
            .select('trackId');
        const favoriteIds = userFavorites.map(fav => fav.trackId);

        if (favoriteIds.length > 0) {
            query._id = { $nin: favoriteIds };
        }

        const recommendations = await MusicTrack.find(query)
            .sort({ plays: -1 })
            .limit(parseInt(limit));

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Record music play
export const recordMusicPlay = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { trackId } = req.body;
        const userId = req.user._id;

        // Increment play count
        const track = await MusicTrack.findByIdAndUpdate(
            trackId,
            { $inc: { plays: 1 } },
            { new: true, session }
        );

        if (!track) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Track not found' });
        }

        // Add to recently played
        await RecentlyPlayedMusic.findOneAndUpdate(
            { userId },
            {
                $push: {
                    tracks: {
                        $each: [{ trackId, playedAt: new Date() }],
                        $slice: -20 // Keep only last 20
                    }
                }
            },
            { upsert: true, session }
        );

        await session.commitTransaction();
        session.endSession();

        res.json(track);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ error: error.message });
    }
};