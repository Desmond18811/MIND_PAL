import { SleepSession, SleepSchedule } from '../models/Sleep.mjs';
import {createNotification} from './notificationController.mjs';
import { updateScore } from './palScoreController.mjs';
import mongoose from 'mongoose';

// Start sleep tracking session
export const startSleepSession = async (req, res) => {
    try {
        const userId = req.user._id;
        const { environmentalFactors } = req.body;

        // Check if there's an unfinished session
        const existingSession = await SleepSession.findOne({
            userId,
            endTime: { $exists: false }
        });

        if (existingSession) {
            return res.status(400).json({
                error: 'You already have an active sleep session'
            });
        }

        const session = await SleepSession.create({
            userId,
            startTime: new Date(),
            environmentalFactors
        });

        // Schedule check for bedtime consistency
        const schedule = await SleepSchedule.findOne({ userId });
        if (schedule) {
            const [targetHour, targetMinute] = schedule.targetBedtime.split(':').map(Number);
            const now = new Date();
            const targetTime = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                targetHour,
                targetMinute
            );

            if (now > targetTime) {
                const minutesLate = Math.round((now - targetTime) / (1000 * 60));
                await sendNotification(userId, {
                    title: 'Bedtime Alert',
                    message: `You went to bed ${minutesLate} minutes late tonight. Try to stick to your schedule for better sleep quality.`,
                    type: 'sleep-alert'
                });
            }
        }

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// End sleep tracking session
export const endSleepSession = async (req, res) => {
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
        const userId = req.user._id;
        const { qualityScore, notes, deviceData } = req.body;

        // Find and complete the current session
        const session = await SleepSession.findOneAndUpdate(
            { userId, endTime: { $exists: false } },
            {
                endTime: new Date(),
                qualityScore,
                notes,
                deviceData,
                $set: {
                    durationMinutes: calculateDurationMinutes(this.startTime, new Date())
                }
            },
            { new: true, session: dbSession }
        );

        if (!session) {
            await dbSession.abortTransaction();
            dbSession.endSession();
            return res.status(404).json({ error: 'No active sleep session found' });
        }

        // Analyze sleep quality and interruptions
        const analysis = await analyzeSleepSession(session);
        const updatedSession = await SleepSession.findByIdAndUpdate(
            session._id,
            {
                phases: analysis.phases,
                interruptions: analysis.interruptions,
                isOptimal: analysis.isOptimal,
                recommendedImprovements: analysis.recommendations
            },
            { new: true, session: dbSession }
        );

        // Update sleep schedule adherence
        await updateSleepScheduleAdherence(userId, session.startTime, session.endTime);

        // Update Pal score based on sleep quality
        await updateScore(userId, {
            type: 'sleep-completed',
            _id: session._id,
            duration: session.durationMinutes,
            quality: session.qualityScore,
            isOptimal: analysis.isOptimal
        });

        await dbSession.commitTransaction();
        dbSession.endSession();

        // Send summary notification
        await sendSleepSummaryNotification(userId, updatedSession);

        res.json(updatedSession);
    } catch (error) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        res.status(500).json({ error: error.message });
    }
};

// Get sleep statistics
export const getSleepStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const { period = 'week' } = req.query;

        const dateRange = getDateRange(period);
        const matchStage = {
            userId: mongoose.Types.ObjectId(userId),
            endTime: { $exists: true },
            startTime: { $gte: dateRange.start, $lte: dateRange.end }
        };

        const stats = await SleepSession.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    avgDuration: { $avg: '$durationMinutes' },
                    avgQuality: { $avg: '$qualityScore' },
                    optimalSessions: {
                        $sum: { $cond: [{ $eq: ['$isOptimal', true] }, 1, 0] }
                    },
                    totalInterruptions: {
                        $sum: { $size: '$interruptions' }
                    },
                    byDayOfWeek: {
                        $push: {
                            dayOfWeek: { $dayOfWeek: '$startTime' },
                            duration: '$durationMinutes',
                            quality: '$qualityScore'
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalSessions: 1,
                    avgDuration: 1,
                    avgQuality: 1,
                    optimalPercentage: {
                        $cond: [
                            { $eq: ['$totalSessions', 0] },
                            0,
                            { $divide: ['$optimalSessions', '$totalSessions'] }
                        ]
                    },
                    avgInterruptions: {
                        $cond: [
                            { $eq: ['$totalSessions', 0] },
                            0,
                            { $divide: ['$totalInterruptions', '$totalSessions'] }
                        ]
                    },
                    dailyPatterns: {
                        $map: {
                            input: [1, 2, 3, 4, 5, 6, 7], // Days of week (1=Sunday)
                            as: 'day',
                            in: {
                                dayOfWeek: '$$day',
                                avgDuration: {
                                    $avg: {
                                        $map: {
                                            input: {
                                                $filter: {
                                                    input: '$byDayOfWeek',
                                                    as: 'entry',
                                                    cond: { $eq: ['$$entry.dayOfWeek', '$$day'] }
                                                }
                                            },
                                            as: 'matched',
                                            in: '$$matched.duration'
                                        }
                                    }
                                },
                                avgQuality: {
                                    $avg: {
                                        $map: {
                                            input: {
                                                $filter: {
                                                    input: '$byDayOfWeek',
                                                    as: 'entry',
                                                    cond: { $eq: ['$$entry.dayOfWeek', '$$day'] }
                                                }
                                            },
                                            as: 'matched',
                                            in: '$$matched.quality'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        const schedule = await SleepSchedule.findOne({ userId });
        const currentStreak = await calculateSleepStreak(userId);

        res.json({
            ...(stats[0] || {
                totalSessions: 0,
                avgDuration: 0,
                avgQuality: 0,
                optimalPercentage: 0,
                avgInterruptions: 0,
                dailyPatterns: Array(7).fill().map((_, i) => ({
                    dayOfWeek: i + 1,
                    avgDuration: 0,
                    avgQuality: 0
                }))
            }),
            schedule,
            currentStreak
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Set sleep schedule
export const setSleepSchedule = async (req, res) => {
    try {
        const userId = req.user._id;
        const { targetBedtime, targetWakeTime } = req.body;

        // Validate time format
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(targetBedtime) ||
            !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(targetWakeTime)) {
            return res.status(400).json({ error: 'Invalid time format. Use HH:MM' });
        }

        const schedule = await SleepSchedule.findOneAndUpdate(
            { userId },
            { targetBedtime, targetWakeTime },
            { upsert: true, new: true }
        );

        // Schedule bedtime reminders
        await scheduleBedtimeReminders(userId, targetBedtime);

        res.json(schedule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper functions
async function analyzeSleepSession(session) {
    // This would integrate with sleep analysis algorithms
    // For now, we'll simulate some analysis
    const interruptions = detectInterruptions(session.deviceData);
    const phases = estimateSleepPhases(session.durationMinutes, interruptions);

    const isOptimal =
        session.durationMinutes >= 450 && // 7.5 hours
        interruptions.length <= 1 &&
        phases.deep >= 0.2 * session.durationMinutes;

    const recommendations = [];
    if (session.durationMinutes < 420) { // 7 hours
        recommendations.push('Increase sleep duration');
    }
    if (interruptions.length > 2) {
        recommendations.push('Reduce nighttime interruptions');
    }
    if (phases.deep < 0.15 * session.durationMinutes) {
        recommendations.push('Improve deep sleep quality');
    }

    return { phases, interruptions, isOptimal, recommendations };
}

async function updateSleepScheduleAdherence(userId, startTime, endTime) {
    const schedule = await SleepSchedule.findOne({ userId });
    if (!schedule) return;

    const [targetBedHour, targetBedMin] = schedule.targetBedtime.split(':').map(Number);
    const [targetWakeHour, targetWakeMin] = schedule.targetWakeTime.split(':').map(Number);

    const bedtime = new Date(startTime);
    const wakeTime = new Date(endTime);

    const targetBedtime = new Date(
        bedtime.getFullYear(),
        bedtime.getMonth(),
        bedtime.getDate(),
        targetBedHour,
        targetBedMin
    );

    const targetWake = new Date(
        wakeTime.getFullYear(),
        wakeTime.getMonth(),
        wakeTime.getDate(),
        targetWakeHour,
        targetWakeMin
    );

    const bedtimeDiff = Math.abs(bedtime - targetBedtime);
    const wakeTimeDiff = Math.abs(wakeTime - targetWake);

    const isAdherent =
        bedtimeDiff < 30 * 60 * 1000 && // Within 30 mins of target bedtime
        wakeTimeDiff < 30 * 60 * 1000;  // Within 30 mins of target wake time

    // Update weekly adherence (simplified)
    await SleepSchedule.updateOne(
        { userId },
        {
            $push: {
                lastWeekAdherence: {
                    $each: [isAdherent],
                    $slice: -7
                }
            },
            $inc: { consistencyScore: isAdherent ? 1 : -1 }
        }
    );
}

async function scheduleBedtimeReminders(userId, targetBedtime) {
    // Cancel any existing reminders
    await Notification.deleteMany({
        userId,
        'metadata.type': 'bedtime-reminder'
    });

    const [hours, minutes] = targetBedtime.split(':').map(Number);
    const reminderTime = new Date();
    reminderTime.setHours(hours - 1, minutes, 0, 0); // 1 hour before bedtime

    // Create new reminder
    await Notification.create({
        userId,
        title: 'Bedtime Reminder',
        message: 'Your scheduled bedtime is in 1 hour. Start winding down for better sleep quality.',
        type: 'reminder',
        category: 'sleep',
        scheduledAt: reminderTime,
        metadata: {
            type: 'bedtime-reminder'
        }
    });
}

async function sendSleepSummaryNotification(userId, session) {
    let message;
    if (session.isOptimal) {
        message = 'Great sleep last night! Your sleep was optimal.';
    } else if (session.durationMinutes < 360) {
        message = `You only slept ${Math.floor(session.durationMinutes/60)} hours last night. Try to get more sleep tonight.`;
    } else {
        message = 'Your sleep analysis is ready. Tap to view recommendations.';
    }

    await sendNotification(userId, {
        title: 'Sleep Summary',
        message,
        type: 'sleep-summary',
        actionUrl: `/sleep/report/${session._id}`,
        metadata: {
            sessionId: session._id
        }
    });
}

async function calculateSleepStreak(userId) {
    const sessions = await SleepSession.find({
        userId,
        endTime: { $exists: true }
    }).sort({ endTime: -1 });

    if (sessions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    // Check if slept today
    const today = new Date().toDateString();
    if (sessions[0].endTime.toDateString() === today) {
        streak++;
        currentDate = new Date(currentDate.getTime() - oneDay);
    }

    // Check consecutive previous days
    for (let i = 0; i < sessions.length; i++) {
        const sessionDate = sessions[i].endTime.toDateString();
        const expectedDate = currentDate.toDateString();

        if (sessionDate === expectedDate) {
            streak++;
            currentDate = new Date(currentDate.getTime() - oneDay);
        } else if (new Date(sessionDate) < new Date(expectedDate)) {
            break;
        }
    }

    return streak;
}