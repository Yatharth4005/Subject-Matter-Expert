# SME Agent Platform

A multimodal AI agent platform powered by **Gemini Live API** and **Google ADK (Agent Development Kit)**. This project enables high-performance, real-time interaction with AI agents that can process voice, video, and text while performing background research.

---

## 🚀 Features

- **Multimodal Interaction**: Supports voice (WebM/WAV), video (MP4), and text-based chat.
- **Gemini Live Integration**: Real-time streaming responses using the latest Gemini models.
- **Agent Development Kit (ADK)**: Flexible agent configuration and tool integration.
- **3D Visualization**: Interactive 3D components on the frontend using React Three Fiber.
- **Background Research**: Automated research agent that provides contextual suggestions during conversations.
- **Web Navigation**: Built-in capability for agents to navigate and capture web content.

---

## 🛠️ Architecture

- **Backend**: FastAPI (Python)
  - WebSocket-based real-time communication.
  - Integration with Google Gen AI and ADK.
  - Session management and persistence (Neon/Drizzle).
- **Frontend**: Next.js (TypeScript)
  - Responsive UI with Tailwind CSS.
  - 3D visualizers for agent state.
  - Streaming Markdown rendering.

---

## 📦 Setup & Installation

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- Google Cloud Project with Gemini API access.

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or `.venv\Scripts\activate` on Windows
pip install -r requirements.txt
```
Create a `.env` file in the `backend` directory with your Google Cloud credentials.

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env.local` file in the `frontend` directory.

---

## 🏃 Running the Project

### Start Backend
```bash
cd backend
python main.py
```

### Start Frontend
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 🛡️ License
Private project. All rights reserved.
