import mongoose from 'mongoose';

const sleepSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: Date,
    durationMinutes: Number,
    qualityScore: {
        type: Number,
        min: 1,
        max: 10
    },
    phases: {
        deep: Number,
        light: Number,
        rem: Number,
        awake: Number
    },
    interruptions: [{
        time: Date,
        durationMinutes: Number,
        reason: String
    }],
    environmentalFactors: {
        noiseLevel: Number,
        roomTemperature: Number,
        lightLevel: Number
    },
    deviceData: {
        movement: [{
            time: Date,
            intensity: Number
        }],
        heartRate: [{
            time: Date,
            bpm: Number
        }]
    },
    notes: String,
    isOptimal: Boolean,
    recommendedImprovements: [String]
}, {
    timestamps: true
});

const sleepScheduleSchema = new mongoose.Schema({
    targetBedtime: {
        type: String, // "22:30" format
        required: true
    },
    targetWakeTime: {
        type: String, // "06:30" format
        required: true
    },
    consistencyScore: Number,
    lastWeekAdherence: [Boolean] // 7 items representing last 7 days
});

export const SleepSession = mongoose.model('SleepSession', sleepSessionSchema);
export const SleepSchedule = mongoose.model('SleepSchedule', sleepScheduleSchema);