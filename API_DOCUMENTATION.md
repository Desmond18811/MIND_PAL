# MindPal API Documentation

Complete documentation of all API endpoints for the MindPal Mental Health Application.

**Base URL:** `http://localhost:3000/api`  
**Authentication:** Most endpoints require JWT token in Authorization header: `Bearer <token>`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Profile](#2-profile)
3. [Serenity AI Chat](#3-serenity-ai-chat)
4. [Voice](#4-voice)
5. [Mood](#5-mood)
6. [Journal](#6-journal)
7. [Sleep](#7-sleep)
8. [Goals](#8-goals)
9. [Meditation](#9-meditation)
10. [Community](#10-community)
11. [Therapists](#11-therapists)
12. [Appointments](#12-appointments)
13. [Assessments](#13-assessments)
14. [Pal Score](#14-pal-score)
15. [Resources](#15-resources)
16. [Stress](#16-stress)
17. [Notifications](#17-notifications)
18. [Chatbot](#18-chatbot-legacy)
19. [Search](#19-search)
20. [Utility](#20-utility)
21. [Help](#21-help)

---

## 1. Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| POST | `/auth/verify-2fa` | Verify 2FA code | No |

### POST /auth/register
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```
**Response:** `{ "token": "jwt_token", "user": {...} }`

### POST /auth/login
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```
**Response:** `{ "token": "jwt_token", "user": {...} }`

### POST /auth/forgot-password
```json
{ "email": "user@example.com" }
```

### POST /auth/reset-password
```json
{
  "token": "reset_token",
  "newPassword": "newSecurePassword123"
}
```

### POST /auth/verify-2fa
```json
{
  "userId": "user_id",
  "code": "123456"
}
```

---

## 2. Profile

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/profile` | Create profile | Yes |
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update profile | Yes |
| DELETE | `/profile` | Delete profile | Yes |
| GET | `/profile/options` | Get profile field options | Yes |

### POST /profile
```json
{
  "displayName": "John",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "timezone": "America/New_York",
  "goals": ["reduce_anxiety", "better_sleep"],
  "notificationPreferences": {
    "dailyReminders": true,
    "weeklyReports": true
  }
}
```

### PUT /profile
```json
{
  "displayName": "Johnny",
  "avatar": "base64_image_data"
}
```

---

## 3. Serenity AI Chat

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/serenity/chat` | Send message to Serenity | Yes |
| GET | `/serenity/sessions` | Get all chat sessions | Yes |
| GET | `/serenity/session/:id` | Get specific session | Yes |
| POST | `/serenity/session` | Create new session | Yes |
| GET | `/serenity/insights` | Get AI-generated insights | Yes |
| GET | `/serenity/suggestions` | Get activity suggestions | Yes |
| GET | `/serenity/permissions` | Get data permissions | Yes |
| POST | `/serenity/permissions` | Update permissions | Yes |
| POST | `/serenity/permissions/grant-all` | Grant all permissions | Yes |
| POST | `/serenity/permissions/revoke-all` | Revoke all permissions | Yes |

### POST /serenity/chat
```json
{
  "message": "I'm feeling anxious today",
  "sessionId": "optional_session_id"
}
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "sessionId": "session_id",
    "message": "I hear you. It's completely normal to feel anxious...",
    "sentiment": { "score": -0.3, "sentiment": "negative" },
    "timestamp": "2026-01-31T12:00:00Z"
  }
}
```

### GET /serenity/suggestions
**Query Params:** `?mood=5&timeOfDay=morning`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "activity": "Breathing Exercise",
      "reason": "A quick breathing session can help calm your nervous system",
      "duration": "5 minutes",
      "priority": 1
    }
  ]
}
```

### POST /serenity/permissions
```json
{
  "permissions": {
    "analyzeMood": true,
    "analyzeSleepData": true,
    "analyzeJournals": false
  }
}
```

---

## 4. Voice

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/voice/upload` | Upload voice note for transcription | Yes |
| POST | `/voice/transcribe` | Transcribe audio only | Yes |
| POST | `/voice/synthesize` | Convert text to speech | Yes |
| GET | `/voice/analyze/:sessionId` | Analyze voice patterns | Yes |

### POST /voice/upload
**Form Data:**
- `audio`: Audio file (wav, webm, mp3, ogg, m4a)
- `sessionId`: Optional session ID
- `language`: Optional language code (default: en-US)
- `generateAudio`: "true" to get audio response

**Response:**
```json
{
  "status": "success",
  "data": {
    "sessionId": "session_id",
    "transcription": "I've been feeling stressed lately",
    "confidence": 0.95,
    "serenityResponse": "I understand. Let's talk about...",
    "audioResponse": "base64_audio_data",
    "sentiment": { "score": -0.4 }
  }
}
```

### POST /voice/synthesize
```json
{
  "text": "Take a deep breath and relax",
  "voice": "en-US-Neural2-F",
  "speed": 1.0
}
```
**Response:** `{ "audioContent": "base64_mp3_data", "contentType": "audio/mp3" }`

---

## 5. Mood

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/mood` | Record mood entry | Yes |
| GET | `/mood/history` | Get mood history | Yes |

### POST /mood
```json
{
  "moodValue": 7,
  "moodLabel": "Happy",
  "factors": ["good_sleep", "exercise"],
  "notes": "Had a great morning workout"
}
```

### GET /mood/history
**Query Params:** `?startDate=2026-01-01&endDate=2026-01-31&limit=30`

---

## 6. Journal

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/journal` | Create journal entry | Yes |
| GET | `/journal/stats` | Get journal analytics | Yes |
| GET | `/journal/:id` | Get specific entry | Yes |
| GET | `/journal/:id/audio` | Stream journal audio | Yes |

### POST /journal
**Form Data:**
- `content`: Text content
- `moodBefore`: Mood rating before writing (1-10)
- `moodAfter`: Mood rating after writing (1-10)
- `tags`: Comma-separated tags
- `audio`: Optional audio file

---

## 7. Sleep

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/sleep/sessions/start` | Start sleep session | Yes |
| POST | `/sleep/sessions/end` | End sleep session | Yes |
| GET | `/sleep/stats` | Get sleep statistics | Yes |
| PUT | `/sleep/schedule` | Set sleep schedule | Yes |
| GET | `/sleep/schedule` | Get sleep schedule | Yes |

### POST /sleep/sessions/start
```json
{
  "startTime": "2026-01-31T23:00:00Z",
  "environment": {
    "temperature": 68,
    "noise": "quiet"
  }
}
```

### POST /sleep/sessions/end
```json
{
  "sessionId": "session_id",
  "endTime": "2026-02-01T07:00:00Z",
  "qualityRating": 8,
  "dreams": ["positive"],
  "interruptions": 1
}
```

---

## 8. Goals

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/goals` | Create goal | Yes |
| GET | `/goals` | Get all goals | Yes |
| PUT | `/goals/:id` | Update goal | Yes |
| DELETE | `/goals/:id` | Delete goal | Yes |
| POST | `/goals/:id/milestones` | Add milestone | Yes |
| PATCH | `/goals/:id/milestones/:milestoneId/complete` | Complete milestone | Yes |
| GET | `/goals/stats` | Get goal statistics | Yes |

### POST /goals
```json
{
  "title": "Practice daily meditation",
  "description": "Meditate for 10 minutes each morning",
  "category": "mindfulness",
  "targetDate": "2026-03-01",
  "milestones": [
    { "title": "Complete first week", "targetDate": "2026-02-07" }
  ]
}
```

---

## 9. Meditation

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/meditation/content` | Get meditation content | No |
| POST | `/meditation/sessions/start` | Start meditation session | Yes |
| POST | `/meditation/sessions/end` | End meditation session | Yes |
| GET | `/meditation/progress` | Get user progress | Yes |
| GET | `/meditation/recommendations` | Get recommendations | Yes |
| POST | `/meditation/content` | Create content (admin) | Yes |

### POST /meditation/sessions/start
```json
{
  "contentId": "content_id",
  "type": "guided",
  "duration": 10
}
```

### POST /meditation/sessions/end
```json
{
  "sessionId": "session_id",
  "completed": true,
  "moodAfter": 8,
  "notes": "Felt very relaxed"
}
```

---

## 10. Community

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/community/feed` | Get community feed | Yes |
| POST | `/community/posts` | Create post | Yes |
| POST | `/community/posts/:id/like` | Like/unlike post | Yes |
| POST | `/community/posts/:id/comments` | Add comment | Yes |
| GET | `/community/posts/:id/comments` | Get comments | Yes |

### POST /community/posts
```json
{
  "content": "Just completed my first week of meditation!",
  "isAnonymous": false,
  "tags": ["meditation", "milestone"]
}
```

---

## 11. Therapists

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/therapists` | Search/list therapists | No |
| GET | `/therapists/:id` | Get therapist profile | No |
| POST | `/therapists/register` | Register as therapist | Yes |
| GET | `/therapists/profile/me` | Get own profile | Yes |
| PUT | `/therapists/profile` | Update profile | Yes |
| PUT | `/therapists/availability` | Set availability | Yes |
| GET | `/therapists/stats/me` | Get own stats | Yes |
| POST | `/therapists/:id/rate` | Rate therapist | Yes |

### GET /therapists
**Query Params:** `?specialization=anxiety&location=New York&page=1&limit=10`

### POST /therapists/register
```json
{
  "licenseNumber": "LIC123456",
  "specializations": ["anxiety", "depression"],
  "bio": "Licensed therapist with 10 years experience",
  "hourlyRate": 150
}
```

---

## 12. Appointments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/appointments/slots` | Get available slots | Yes |
| POST | `/appointments/book` | Book appointment | Yes |
| GET | `/appointments/my-appointments` | Get user's appointments | Yes |

### POST /appointments/book
```json
{
  "slotId": "slot_123",
  "reason": "Anxiety management"
}
```

---

## 13. Assessments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/assessment/questions` | Get assessment questions | Yes |
| POST | `/assessment/submit` | Submit assessment | Yes |

### POST /assessment/submit
```json
{
  "assessmentType": "anxiety",
  "responses": [
    { "questionId": "q1", "answer": 3 },
    { "questionId": "q2", "answer": 2 }
  ]
}
```

---

## 14. Pal Score

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/freud-score` | Get current Pal score | Yes |
| GET | `/freud-score/history` | Get score history | Yes |
| GET | `/freud-score/insights` | Get score insights | Yes |

### GET /freud-score
**Response:**
```json
{
  "status": "success",
  "data": {
    "score": 72,
    "components": {
      "mood": 75,
      "sleep": 80,
      "activity": 65,
      "social": 70
    },
    "trend": "improving"
  }
}
```

---

## 15. Resources

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/resources` | Get resources | Yes |
| GET | `/resources/daily-pick` | Get daily recommendation | Yes |
| GET | `/resources/:id/speak` | Read article aloud | Yes |
| GET | `/resources/:id/play` | Get playback info | Yes |
| POST | `/resources/:id/view` | Track view | Yes |

### GET /resources
**Query Params:** `?type=article&category=anxiety&search=meditation&page=1&limit=20`

---

## 16. Stress

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/stress/analyze-face` | Analyze facial expression | Yes |
| GET | `/stress/history` | Get stress history | Yes |

### POST /stress/analyze-face
**Form Data:**
- `image`: Image file (jpg, png)

**Response:**
```json
{
  "status": "success",
  "data": {
    "stressLevel": 0.6,
    "emotions": ["stressed", "tired"],
    "recommendations": ["Try a breathing exercise"]
  }
}
```

---

## 17. Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | Get notifications | Yes |
| PUT | `/notifications/:id/read` | Mark as read | Yes |
| PUT | `/notifications/settings` | Update settings | Yes |

---

## 18. Chatbot (Legacy)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/chatbot/session` | Start session | Yes |
| GET | `/chatbot/history` | Get chat history | Yes |
| POST | `/chatbot/message` | Send message | Yes |
| GET | `/chatbot/message/:sessionId` | Get last response | Yes |

---

## 19. Search

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/search` | Global search | Yes |
| GET | `/search/suggestions` | Get search suggestions | Yes |

### GET /search
**Query Params:** `?q=meditation&type=all`

---

## 20. Utility

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/utility/health` | Health check | No |
| GET | `/utility/version` | Get API version | No |

---

## 21. Help

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/help/faqs` | Get FAQs | No |
| GET | `/help/emergency` | Get emergency resources | No |

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
