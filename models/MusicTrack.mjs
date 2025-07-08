import mongoose from 'mongoose';

const musicTrackSchema = new mongoose.Schema({
    // Epidemic Sound metadata
    epidemicSoundId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    album: String,
    duration: { // in seconds
        type: Number,
        required: true
    },
    genre: {
        type: String,
        enum: ['ambient', 'classical', 'electronic', 'nature', 'piano', 'jazz', 'meditation']
    },
    mood: {
        type: String,
        enum: ['calm', 'energizing', 'focus', 'relaxing', 'uplifting', 'sleep']
    },
    bpm: Number,
    tags: [String],
    audioUrl: {
        type: String,
        required: true
    },
    coverArtUrl: String,
    isPremium: {
        type: Boolean,
        default: true
    },
    licenseInfo: {
        type: String,
        default: 'Epidemic Sound Standard License'
    },
    plays: {
        type: Number,
        default: 0
    },
    favorites: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model('MusicTrack', musicTrackSchema);