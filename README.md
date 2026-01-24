# MIND_PAL 🧠

MindPal is a comprehensive AI-powered mental health companion application. It features a robust Node.js backend with advanced AI capabilities and a React Native (Expo) mobile application.

## 🌟 Key Features

### Serenity AI Agent
*   **Multi-Modal**: Supports both text and voice interactions with natural, empathy-driven responses.
*   **Personality Engine**: Custom voice modulation (speed/pitch) based on emotional context (Encouraging, Calming, Empathetic).
*   **Memory & Learning**: Remembers user preferences, sleep patterns, and conversation history using advanced ML inference.
*   **Multi-Provider Fallback**: Automatically switches between OpenAI, Google Gemini, and Hugging Face to ensure 100% uptime.

### "Hogan's Face" (Stress Detector)
*   **Visual Analysis**: Uses deep vision models to detect stress and fatigue levels from user photos.
*   **Real-time Alerts**: Proactively suggests breathing exercises if high stress is detected.

### The Community
*   **"The Vent"**: A social feed for public or anonymous sharing.
*   **Sentiment Tracking**: Community posts are analyzed to track global mood trends.

### Resources & Audio
*   **Mindful Library**: Curated articles and meditations scraped daily from NAMI and Mindful.org.
*   **Audio Playback**: Listen to any article using Serenity's TTS engine.
*   **Spotify Integration**: Deep linking to play relaxation tracks directly in Spotify.

## 🏗️ Architecture

### Backend (`/`)
*   **Runtime**: Node.js (Express)
*   **Database**: MongoDB (Mongoose)
*   **Real-time**: Socket.io for chat and voice streaming
*   **AI Orchestration**: Custom `aiAdapter` and `mlService`
*   **Scraping**: Automated cron jobs for content aggregation

### Mobile App (`/app`)
*   **Framework**: React Native (Expo)
*   **Status**: Initialized blank template ready for UI development.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB
*   Git

### Backend Setup
1.  Navigate to the root directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment:
    *   Rename `example.env` to `.env.development.local`.
    *   Add your API keys (OpenAI, Google Cloud, MongoDB URI).
4.  Start the server:
    ```bash
    npm run dev
    ```

### Mobile App Setup
1.  Navigate to the app directory:
    ```bash
    cd app
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start Expo:
    ```bash
    npx expo start
    ```

## 🤝 Contributing
1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License
distributed under the MIT License. see `LICENSE` for more information.
