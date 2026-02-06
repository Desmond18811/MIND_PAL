/**
 * MindPal API Service
 * Typed API client for React Native / Expo
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ApiResponse,
    PaginatedResponse,
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserProfile,
    ChatRequest,
    ChatResponse,
    ChatSession,
    Suggestion,
    DataPermissions,
    Insights,
    VoiceUploadResponse,
    TranscriptionResponse,
    SynthesisResponse,
    MoodEntry,
    MoodRequest,
    JournalEntry,
    JournalAnalytics,
    SleepSession,
    SleepStats,
    SleepSchedule,
    Goal,
    GoalRequest,
    Milestone,
    MeditationContent,
    MeditationSession,
    MeditationProgress,
    Post,
    Comment,
    PostRequest,
    Therapist,
    AppointmentSlot,
    Appointment,
    AssessmentQuestion,
    AssessmentSubmission,
    AssessmentResult,
    PalScore,
    PalScoreHistory,
    Resource,
    PlaybackInfo,
    Notification,
} from '../types/types';

// Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://mind-pal-jgpr.onrender.com/api';
const TOKEN_KEY = '@mindpal_token';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired - clear storage
            await AsyncStorage.removeItem(TOKEN_KEY);
            // Could emit an event here for navigation to login
        }
        return Promise.reject(error);
    }
);

// ============ Token Management ============

export const setAuthToken = async (token: string): Promise<void> => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = async (): Promise<string | null> => {
    return AsyncStorage.getItem(TOKEN_KEY);
};

export const clearAuthToken = async (): Promise<void> => {
    await AsyncStorage.removeItem(TOKEN_KEY);
};

// ============ Auth API ============

export const authApi = {
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        if (response.data.token) {
            await setAuthToken(response.data.token);
        }
        return response.data;
    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        if (response.data.token) {
            await setAuthToken(response.data.token);
        }
        return response.data;
    },

    forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
        const response = await api.post<ApiResponse<null>>('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<null>> => {
        const response = await api.post<ApiResponse<null>>('/auth/reset-password', { token, newPassword });
        return response.data;
    },

    verify2FA: async (userId: string, code: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/verify-2fa', { userId, code });
        return response.data;
    },

    logout: async (): Promise<void> => {
        await clearAuthToken();
    },
};

// ============ Profile API ============

export const profileApi = {
    create: async (data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> => {
        const response = await api.post<ApiResponse<UserProfile>>('/profile', data);
        return response.data;
    },

    get: async (): Promise<ApiResponse<UserProfile>> => {
        const response = await api.get<ApiResponse<UserProfile>>('/profile');
        return response.data;
    },

    update: async (data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> => {
        const response = await api.put<ApiResponse<UserProfile>>('/profile', data);
        return response.data;
    },

    delete: async (): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>('/profile');
        return response.data;
    },

    getOptions: async (): Promise<ApiResponse<Record<string, string[]>>> => {
        const response = await api.get<ApiResponse<Record<string, string[]>>>('/profile/options');
        return response.data;
    },
};

// ============ Serenity AI API ============

export const serenityApi = {
    chat: async (data: ChatRequest): Promise<ApiResponse<ChatResponse>> => {
        const response = await api.post<ApiResponse<ChatResponse>>('/serenity/chat', data);
        return response.data;
    },

    getSessions: async (): Promise<ApiResponse<ChatSession[]>> => {
        const response = await api.get<ApiResponse<ChatSession[]>>('/serenity/sessions');
        return response.data;
    },

    getSession: async (id: string): Promise<ApiResponse<ChatSession>> => {
        const response = await api.get<ApiResponse<ChatSession>>(`/serenity/session/${id}`);
        return response.data;
    },

    createSession: async (type: 'text' | 'voice' = 'text'): Promise<ApiResponse<{ sessionId: string }>> => {
        const response = await api.post<ApiResponse<{ sessionId: string }>>('/serenity/session', { type });
        return response.data;
    },

    getInsights: async (): Promise<ApiResponse<Insights>> => {
        const response = await api.get<ApiResponse<Insights>>('/serenity/insights');
        return response.data;
    },

    getSuggestions: async (mood?: number, timeOfDay?: string): Promise<ApiResponse<Suggestion[]>> => {
        const params = new URLSearchParams();
        if (mood) params.append('mood', mood.toString());
        if (timeOfDay) params.append('timeOfDay', timeOfDay);
        const response = await api.get<ApiResponse<Suggestion[]>>(`/serenity/suggestions?${params}`);
        return response.data;
    },

    getPermissions: async (): Promise<ApiResponse<{ permissions: DataPermissions }>> => {
        const response = await api.get<ApiResponse<{ permissions: DataPermissions }>>('/serenity/permissions');
        return response.data;
    },

    updatePermissions: async (permissions: Partial<DataPermissions>): Promise<ApiResponse<{ permissions: DataPermissions }>> => {
        const response = await api.post<ApiResponse<{ permissions: DataPermissions }>>('/serenity/permissions', { permissions });
        return response.data;
    },

    grantAllPermissions: async (): Promise<ApiResponse<{ permissions: DataPermissions }>> => {
        const response = await api.post<ApiResponse<{ permissions: DataPermissions }>>('/serenity/permissions/grant-all');
        return response.data;
    },

    revokeAllPermissions: async (): Promise<ApiResponse<{ permissions: DataPermissions }>> => {
        const response = await api.post<ApiResponse<{ permissions: DataPermissions }>>('/serenity/permissions/revoke-all');
        return response.data;
    },
};

// ============ Voice API ============

export const voiceApi = {
    upload: async (
        audioFile: FormData,
        sessionId?: string,
        generateAudio?: boolean
    ): Promise<ApiResponse<VoiceUploadResponse>> => {
        if (sessionId) audioFile.append('sessionId', sessionId);
        if (generateAudio) audioFile.append('generateAudio', 'true');

        const response = await api.post<ApiResponse<VoiceUploadResponse>>('/voice/upload', audioFile, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    transcribe: async (audioFile: FormData): Promise<ApiResponse<TranscriptionResponse>> => {
        const response = await api.post<ApiResponse<TranscriptionResponse>>('/voice/transcribe', audioFile, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    synthesize: async (text: string, voice?: string, speed?: number): Promise<ApiResponse<SynthesisResponse>> => {
        const response = await api.post<ApiResponse<SynthesisResponse>>('/voice/synthesize', { text, voice, speed });
        return response.data;
    },

    analyzeSession: async (sessionId: string): Promise<ApiResponse<any>> => {
        const response = await api.get<ApiResponse<any>>(`/voice/analyze/${sessionId}`);
        return response.data;
    },
};

// ============ Mood API ============

export const moodApi = {
    record: async (data: MoodRequest): Promise<ApiResponse<MoodEntry>> => {
        const response = await api.post<ApiResponse<MoodEntry>>('/mood', data);
        return response.data;
    },

    getHistory: async (startDate?: string, endDate?: string, limit?: number): Promise<ApiResponse<MoodEntry[]>> => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (limit) params.append('limit', limit.toString());
        const response = await api.get<ApiResponse<MoodEntry[]>>(`/mood/history?${params}`);
        return response.data;
    },
};

// ============ Journal API ============

export const journalApi = {
    create: async (formData: FormData): Promise<ApiResponse<JournalEntry>> => {
        const response = await api.post<ApiResponse<JournalEntry>>('/journal', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    get: async (id: string): Promise<ApiResponse<JournalEntry>> => {
        const response = await api.get<ApiResponse<JournalEntry>>(`/journal/${id}`);
        return response.data;
    },

    getStats: async (): Promise<ApiResponse<JournalAnalytics>> => {
        const response = await api.get<ApiResponse<JournalAnalytics>>('/journal/stats');
        return response.data;
    },

    getAudioUrl: (id: string): string => `${API_BASE_URL}/journal/${id}/audio`,
};

// ============ Sleep API ============

export const sleepApi = {
    startSession: async (data: Partial<SleepSession>): Promise<ApiResponse<SleepSession>> => {
        const response = await api.post<ApiResponse<SleepSession>>('/sleep/sessions/start', data);
        return response.data;
    },

    endSession: async (data: { sessionId: string; endTime: string; qualityRating?: number }): Promise<ApiResponse<SleepSession>> => {
        const response = await api.post<ApiResponse<SleepSession>>('/sleep/sessions/end', data);
        return response.data;
    },

    getStats: async (): Promise<ApiResponse<SleepStats>> => {
        const response = await api.get<ApiResponse<SleepStats>>('/sleep/stats');
        return response.data;
    },

    setSchedule: async (schedule: SleepSchedule): Promise<ApiResponse<SleepSchedule>> => {
        const response = await api.put<ApiResponse<SleepSchedule>>('/sleep/schedule', schedule);
        return response.data;
    },

    getSchedule: async (): Promise<ApiResponse<SleepSchedule>> => {
        const response = await api.get<ApiResponse<SleepSchedule>>('/sleep/schedule');
        return response.data;
    },
};

// ============ Goals API ============

export const goalsApi = {
    create: async (data: GoalRequest): Promise<ApiResponse<Goal>> => {
        const response = await api.post<ApiResponse<Goal>>('/goals', data);
        return response.data;
    },

    getAll: async (): Promise<ApiResponse<Goal[]>> => {
        const response = await api.get<ApiResponse<Goal[]>>('/goals');
        return response.data;
    },

    update: async (id: string, data: Partial<GoalRequest>): Promise<ApiResponse<Goal>> => {
        const response = await api.put<ApiResponse<Goal>>(`/goals/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`/goals/${id}`);
        return response.data;
    },

    addMilestone: async (goalId: string, milestone: { title: string; targetDate?: string }): Promise<ApiResponse<Goal>> => {
        const response = await api.post<ApiResponse<Goal>>(`/goals/${goalId}/milestones`, milestone);
        return response.data;
    },

    completeMilestone: async (goalId: string, milestoneId: string): Promise<ApiResponse<Goal>> => {
        const response = await api.patch<ApiResponse<Goal>>(`/goals/${goalId}/milestones/${milestoneId}/complete`);
        return response.data;
    },

    getStats: async (): Promise<ApiResponse<any>> => {
        const response = await api.get<ApiResponse<any>>('/goals/stats');
        return response.data;
    },
};

// ============ Meditation API ============

export const meditationApi = {
    getContent: async (): Promise<ApiResponse<MeditationContent[]>> => {
        const response = await api.get<ApiResponse<MeditationContent[]>>('/meditation/content');
        return response.data;
    },

    startSession: async (data: { contentId?: string; type: string; duration: number }): Promise<ApiResponse<MeditationSession>> => {
        const response = await api.post<ApiResponse<MeditationSession>>('/meditation/sessions/start', data);
        return response.data;
    },

    endSession: async (data: { sessionId: string; completed: boolean; moodAfter?: number }): Promise<ApiResponse<MeditationSession>> => {
        const response = await api.post<ApiResponse<MeditationSession>>('/meditation/sessions/end', data);
        return response.data;
    },

    getProgress: async (): Promise<ApiResponse<MeditationProgress>> => {
        const response = await api.get<ApiResponse<MeditationProgress>>('/meditation/progress');
        return response.data;
    },

    getRecommendations: async (): Promise<ApiResponse<MeditationContent[]>> => {
        const response = await api.get<ApiResponse<MeditationContent[]>>('/meditation/recommendations');
        return response.data;
    },
};

// ============ Community API ============

export const communityApi = {
    getFeed: async (page = 1, limit = 20, tag?: string): Promise<ApiResponse<Post[]>> => {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        if (tag) params.append('tag', tag);
        const response = await api.get<ApiResponse<Post[]>>(`/community/feed?${params}`);
        return response.data;
    },

    createPost: async (data: PostRequest): Promise<ApiResponse<Post>> => {
        const response = await api.post<ApiResponse<Post>>('/community/posts', data);
        return response.data;
    },

    likePost: async (postId: string): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> => {
        const response = await api.post<ApiResponse<{ liked: boolean; likeCount: number }>>(`/community/posts/${postId}/like`);
        return response.data;
    },

    addComment: async (postId: string, content: string, isAnonymous?: boolean): Promise<ApiResponse<Comment>> => {
        const response = await api.post<ApiResponse<Comment>>(`/community/posts/${postId}/comments`, { content, isAnonymous });
        return response.data;
    },

    getComments: async (postId: string): Promise<ApiResponse<Comment[]>> => {
        const response = await api.get<ApiResponse<Comment[]>>(`/community/posts/${postId}/comments`);
        return response.data;
    },
};

// ============ Therapist API ============

export const therapistApi = {
    search: async (params?: { specialization?: string; location?: string; page?: number }): Promise<PaginatedResponse<Therapist>> => {
        const queryParams = new URLSearchParams();
        if (params?.specialization) queryParams.append('specialization', params.specialization);
        if (params?.location) queryParams.append('location', params.location);
        if (params?.page) queryParams.append('page', params.page.toString());
        const response = await api.get<PaginatedResponse<Therapist>>(`/therapists?${queryParams}`);
        return response.data;
    },

    get: async (id: string): Promise<ApiResponse<Therapist>> => {
        const response = await api.get<ApiResponse<Therapist>>(`/therapists/${id}`);
        return response.data;
    },

    register: async (data: Partial<Therapist>): Promise<ApiResponse<Therapist>> => {
        const response = await api.post<ApiResponse<Therapist>>('/therapists/register', data);
        return response.data;
    },

    getMyProfile: async (): Promise<ApiResponse<Therapist>> => {
        const response = await api.get<ApiResponse<Therapist>>('/therapists/profile/me');
        return response.data;
    },

    updateProfile: async (data: Partial<Therapist>): Promise<ApiResponse<Therapist>> => {
        const response = await api.put<ApiResponse<Therapist>>('/therapists/profile', data);
        return response.data;
    },

    setAvailability: async (availability: Therapist['availability']): Promise<ApiResponse<Therapist>> => {
        const response = await api.put<ApiResponse<Therapist>>('/therapists/availability', { availability });
        return response.data;
    },

    rate: async (therapistId: string, rating: number, review?: string): Promise<ApiResponse<null>> => {
        const response = await api.post<ApiResponse<null>>(`/therapists/${therapistId}/rate`, { rating, review });
        return response.data;
    },
};

// ============ Appointments API ============

export const appointmentsApi = {
    getSlots: async (): Promise<ApiResponse<AppointmentSlot[]>> => {
        const response = await api.get<ApiResponse<AppointmentSlot[]>>('/appointments/slots');
        return response.data;
    },

    book: async (slotId: string, reason?: string): Promise<ApiResponse<Appointment>> => {
        const response = await api.post<ApiResponse<Appointment>>('/appointments/book', { slotId, reason });
        return response.data;
    },

    getMyAppointments: async (): Promise<ApiResponse<Appointment[]>> => {
        const response = await api.get<ApiResponse<Appointment[]>>('/appointments/my-appointments');
        return response.data;
    },
};

// ============ Assessment API ============

export const assessmentApi = {
    getQuestions: async (): Promise<ApiResponse<AssessmentQuestion[]>> => {
        const response = await api.get<ApiResponse<AssessmentQuestion[]>>('/assessment/questions');
        return response.data;
    },

    submit: async (data: AssessmentSubmission): Promise<ApiResponse<AssessmentResult>> => {
        const response = await api.post<ApiResponse<AssessmentResult>>('/assessment/submit', data);
        return response.data;
    },
};

// ============ Pal Score API ============

export const palScoreApi = {
    get: async (): Promise<ApiResponse<PalScore>> => {
        const response = await api.get<ApiResponse<PalScore>>('/freud-score');
        return response.data;
    },

    getHistory: async (startDate?: string, endDate?: string): Promise<ApiResponse<PalScoreHistory[]>> => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await api.get<ApiResponse<PalScoreHistory[]>>(`/freud-score/history?${params}`);
        return response.data;
    },

    getInsights: async (): Promise<ApiResponse<any>> => {
        const response = await api.get<ApiResponse<any>>('/freud-score/insights');
        return response.data;
    },
};

// ============ Resources API ============

export const resourcesApi = {
    getAll: async (params?: { type?: string; category?: string; search?: string; page?: number }): Promise<PaginatedResponse<Resource>> => {
        const queryParams = new URLSearchParams();
        if (params?.type) queryParams.append('type', params.type);
        if (params?.category) queryParams.append('category', params.category);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());
        const response = await api.get<PaginatedResponse<Resource>>(`/resources?${queryParams}`);
        return response.data;
    },

    getDailyPick: async (): Promise<ApiResponse<Resource>> => {
        const response = await api.get<ApiResponse<Resource>>('/resources/daily-pick');
        return response.data;
    },

    speak: async (id: string): Promise<ApiResponse<{ audioContent: string }>> => {
        const response = await api.get<ApiResponse<{ audioContent: string }>>(`/resources/${id}/speak`);
        return response.data;
    },

    getPlaybackInfo: async (id: string): Promise<ApiResponse<PlaybackInfo>> => {
        const response = await api.get<ApiResponse<PlaybackInfo>>(`/resources/${id}/play`);
        return response.data;
    },

    trackView: async (id: string): Promise<ApiResponse<null>> => {
        const response = await api.post<ApiResponse<null>>(`/resources/${id}/view`);
        return response.data;
    },
};

// ============ Notifications API ============

export const notificationsApi = {
    getAll: async (): Promise<ApiResponse<Notification[]>> => {
        const response = await api.get<ApiResponse<Notification[]>>('/notifications');
        return response.data;
    },

    markAsRead: async (id: string): Promise<ApiResponse<null>> => {
        const response = await api.put<ApiResponse<null>>(`/notifications/${id}/read`);
        return response.data;
    },

    updateSettings: async (settings: any): Promise<ApiResponse<any>> => {
        const response = await api.put<ApiResponse<any>>('/notifications/settings', settings);
        return response.data;
    },
};

// ============ Stress API ============

export const stressApi = {
    analyzeFace: async (imageFormData: FormData): Promise<ApiResponse<any>> => {
        const response = await api.post<ApiResponse<any>>('/stress/analyze-face', imageFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getHistory: async (): Promise<ApiResponse<any[]>> => {
        const response = await api.get<ApiResponse<any[]>>('/stress/history');
        return response.data;
    },
};

// ============ Export Default API ============

export default {
    auth: authApi,
    profile: profileApi,
    serenity: serenityApi,
    voice: voiceApi,
    mood: moodApi,
    journal: journalApi,
    sleep: sleepApi,
    goals: goalsApi,
    meditation: meditationApi,
    community: communityApi,
    therapist: therapistApi,
    appointments: appointmentsApi,
    assessment: assessmentApi,
    palScore: palScoreApi,
    resources: resourcesApi,
    notifications: notificationsApi,
    stress: stressApi,
    setAuthToken,
    getAuthToken,
    clearAuthToken,
};
