/**
 * MindPal API Types
 * TypeScript interfaces for all API requests and responses
 */

// ============ Common Types ============

export interface ApiResponse<T> {
    status: 'success' | 'error' | 'permission_required';
    message?: string;
    data?: T;
}

export interface PaginatedResponse<T> {
    status: 'success' | 'error';
    data: T[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    };
}

// ============ Auth Types ============

export interface User {
    _id: string;
    email: string;
    name: string;
    profile?: UserProfile;
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

// ============ Profile Types ============

export interface UserProfile {
    displayName: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    avatar?: string;
    timezone?: string;
    goals?: string[];
    notificationPreferences?: NotificationPreferences;
}

export interface NotificationPreferences {
    dailyReminders: boolean;
    weeklyReports: boolean;
    pushNotifications: boolean;
}

// ============ Serenity AI Types ============

export interface ChatMessage {
    sender: 'user' | 'serenity';
    content: string;
    type: 'text' | 'voice';
    timestamp: string;
    sentiment?: number;
}

export interface ChatSession {
    _id: string;
    userId: string;
    sessionType: 'text' | 'voice';
    messages: ChatMessage[];
    metadata?: {
        topicsDiscussed?: string[];
        lastActivity?: string;
    };
    createdAt: string;
}

export interface ChatRequest {
    message: string;
    sessionId?: string;
}

export interface ChatResponse {
    sessionId: string;
    message: string;
    sentiment: SentimentAnalysis;
    timestamp: string;
}

export interface SentimentAnalysis {
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    emotions?: string[];
    intensity?: 'low' | 'medium' | 'high';
}

export interface Suggestion {
    activity: string;
    reason: string;
    duration: string;
    priority: number;
    personalized?: boolean;
}

export interface DataPermissions {
    analyzeJournals: boolean;
    analyzeVoiceNotes: boolean;
    analyzeConversations: boolean;
    analyzeSleepData: boolean;
    analyzeAssessments: boolean;
    analyzeMood: boolean;
}

export interface Insights {
    overallMood: string;
    sleepQuality: string;
    areasOfStrength: string[];
    areasForGrowth: string[];
    recommendations: string[];
    encouragement: string;
    patterns: string[];
}

// ============ Voice Types ============

export interface VoiceUploadResponse {
    sessionId: string;
    transcription: string;
    confidence: number;
    serenityResponse: string;
    audioResponse?: string;
    sentiment: SentimentAnalysis;
    timestamp: string;
}

export interface TranscriptionResponse {
    text: string;
    confidence: number;
    duration?: number;
}

export interface SynthesisResponse {
    audioContent: string;
    contentType: string;
}

// ============ Mood Types ============

export interface MoodEntry {
    _id: string;
    userId: string;
    moodValue: number;
    moodLabel: string;
    factors?: string[];
    notes?: string;
    datetime: string;
}

export interface MoodRequest {
    moodValue: number;
    moodLabel: string;
    factors?: string[];
    notes?: string;
}

// ============ Journal Types ============

export interface JournalEntry {
    _id: string;
    userId: string;
    content: string;
    moodBefore?: number;
    moodAfter?: number;
    tags?: string[];
    sentimentScore?: number;
    keywords?: string[];
    audioUrl?: string;
    date: string;
}

export interface JournalAnalytics {
    totalEntries: number;
    averageSentiment: number;
    topKeywords: string[];
    moodTrend: string;
}

// ============ Sleep Types ============

export interface SleepSession {
    _id: string;
    userId: string;
    startTime: string;
    endTime?: string;
    durationMinutes?: number;
    qualityScore?: number;
    interruptions?: number;
    dreams?: string[];
}

export interface SleepStats {
    averageDuration: number;
    averageQuality: number;
    sleepTrend: string;
    recommendations: string[];
}

export interface SleepSchedule {
    bedtime: string;
    wakeTime: string;
    targetDuration: number;
}

// ============ Goals Types ============

export interface Goal {
    _id: string;
    userId: string;
    title: string;
    description?: string;
    category: string;
    targetDate?: string;
    progress: number;
    milestones?: Milestone[];
    status: 'active' | 'completed' | 'paused';
    createdAt: string;
}

export interface Milestone {
    _id: string;
    title: string;
    targetDate?: string;
    completed: boolean;
    completedAt?: string;
}

export interface GoalRequest {
    title: string;
    description?: string;
    category: string;
    targetDate?: string;
    milestones?: { title: string; targetDate?: string }[];
}

// ============ Meditation Types ============

export interface MeditationContent {
    _id: string;
    title: string;
    description: string;
    type: 'guided' | 'unguided' | 'breathing' | 'body_scan';
    duration: number;
    audioUrl?: string;
    category: string;
}

export interface MeditationSession {
    _id: string;
    userId: string;
    contentId?: string;
    type: string;
    duration: number;
    completed: boolean;
    moodBefore?: number;
    moodAfter?: number;
}

export interface MeditationProgress {
    totalSessions: number;
    totalMinutes: number;
    streak: number;
    lastSession?: string;
}

// ============ Community Types ============

export interface Post {
    _id: string;
    userId: { displayName: string; avatar?: string } | null;
    content: string;
    isAnonymous: boolean;
    tags?: string[];
    likeCount: number;
    commentCount: number;
    userLiked?: boolean;
    createdAt: string;
}

export interface Comment {
    _id: string;
    postId: string;
    userId: { displayName: string; avatar?: string } | null;
    content: string;
    isAnonymous: boolean;
    createdAt: string;
}

export interface PostRequest {
    content: string;
    isAnonymous?: boolean;
    tags?: string[];
}

// ============ Therapist Types ============

export interface Therapist {
    _id: string;
    userId: string;
    licenseNumber: string;
    specializations: string[];
    bio: string;
    hourlyRate: number;
    rating: number;
    reviewCount: number;
    availability?: TherapistAvailability[];
}

export interface TherapistAvailability {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

// ============ Appointment Types ============

export interface AppointmentSlot {
    id: string;
    time: string;
    therapist: string;
    specialization: string;
}

export interface Appointment {
    id: string;
    therapist: string;
    time: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    reason?: string;
}

// ============ Assessment Types ============

export interface AssessmentQuestion {
    id: string;
    text: string;
    type: 'scale' | 'multiple_choice' | 'text';
    options?: string[];
}

export interface AssessmentSubmission {
    assessmentType: string;
    responses: { questionId: string; answer: number | string }[];
}

export interface AssessmentResult {
    score: number;
    interpretation: string;
    recommendations: string[];
}

// ============ Pal Score Types ============

export interface PalScore {
    score: number;
    components: {
        mood: number;
        sleep: number;
        activity: number;
        social: number;
    };
    trend: 'improving' | 'stable' | 'declining';
    calculatedAt: string;
}

export interface PalScoreHistory {
    date: string;
    score: number;
}

// ============ Resource Types ============

export interface Resource {
    _id: string;
    title: string;
    description: string;
    type: 'article' | 'video' | 'podcast' | 'music';
    category: string;
    url: string;
    source?: { name: string; logo?: string };
    views: number;
    createdAt: string;
}

export interface PlaybackInfo {
    type: 'web' | 'spotify' | 'youtube';
    url: string;
    spotifyUri?: string;
    embedUrl?: string;
}

// ============ Notification Types ============

export interface Notification {
    _id: string;
    userId: string;
    title: string;
    body: string;
    type: string;
    read: boolean;
    createdAt: string;
}

// ============ Navigation Types ============

export type RootStackParamList = {
    Welcome: undefined;
    Onboarding: undefined;
    OnboardingTwo: undefined;
    OnboardingThree: undefined;
    OnboardingFour: undefined;
    OnboardingFive: undefined;
    SignIn: undefined;
    SignUp: undefined;
    Home: undefined;
    ForgotPassword: undefined;
    ResetPassword: { token: string };
    Assessment: undefined;
    ProfileSetup: undefined;
    PasswordSetup: undefined;
    OTPVerification: { email: string };
    FingerprintSetup: undefined;
    MeditationSetup: undefined;
    ComputingScore: undefined;
    FreudScoreResult: undefined;
    FreudScore: undefined;
    AISuggestions: undefined;
    MindfulnessActivities: undefined;
};
