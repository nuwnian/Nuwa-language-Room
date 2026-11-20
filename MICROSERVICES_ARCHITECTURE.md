# Nuwa Language Room - Microservices Architecture

## Overview
This project implements a language learning platform using a microservices architecture with the following services:

## Services Architecture

```
┌─────────────────┐
│   Frontend      │ (React + Tailwind)
│   Port: 3000    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   API Gateway   │ (Nginx)
│   Port: 80/443  │
└─────────────────┘
         │
    ┌────┴────────────────────────────┐
    │                                 │
    ▼                                 ▼
┌─────────────┐                 ┌─────────────┐
│ User Service│                 │Chat Service │
│ Port: 3001  │                 │Port: 3002   │
└─────────────┘                 └─────────────┘
    │                                 │
    │            ┌─────────────┐      │
    └────────────│ AI Service  │──────┘
                 │ Port: 8001  │
                 └─────────────┘
                        │
                        ▼
                ┌─────────────┐
                │Notification │
                │Service      │
                │Port: 3003   │
                └─────────────┘
```

## Service Breakdown

### 1. API Gateway (Nginx)
- **Purpose**: Route requests, load balancing, SSL termination
- **Port**: 80/443
- **Technology**: Nginx
- **Routes**:
  - `/api/auth/*` → User Service
  - `/api/chat/*` → Chat Service  
  - `/api/ai/*` → AI Service
  - `/api/notifications/*` → Notification Service

### 2. User Service (Node.js)
- **Purpose**: Authentication, user management, profiles
- **Port**: 3001
- **Technology**: Node.js + Express + Supabase
- **Endpoints**:
  - `POST /auth/login`
  - `POST /auth/register` 
  - `GET /auth/profile`
  - `PUT /auth/profile`
  - `POST /auth/logout`

### 3. Chat Service (Node.js)
- **Purpose**: Real-time messaging, conversation history
- **Port**: 3002
- **Technology**: Node.js + Express + Socket.io + Supabase
- **Endpoints**:
  - `GET /conversations`
  - `POST /conversations`
  - `GET /conversations/:id/messages`
  - `POST /conversations/:id/messages`
  - WebSocket for real-time chat

### 4. AI Service (Python)
- **Purpose**: Language correction, translation, learning recommendations
- **Port**: 8001
- **Technology**: Python + FastAPI + OpenAI
- **Endpoints**:
  - `POST /correct-text`
  - `POST /translate`
  - `POST /analyze-language-level`
  - `GET /learning-suggestions`

### 5. Notification Service (Node.js)
- **Purpose**: Real-time notifications, progress tracking
- **Port**: 3003
- **Technology**: Node.js + Express + Socket.io
- **Endpoints**:
  - `GET /notifications`
  - `POST /notifications/send`
  - WebSocket for real-time notifications

### 6. Frontend Service (React)
- **Purpose**: User interface
- **Port**: 3000
- **Technology**: React + Tailwind CSS + Vite
- **Features**:
  - Chat interface
  - Correction panel
  - User authentication
  - Real-time notifications

## Database Strategy
- **Supabase**: Primary database for user data, conversations, messages
- **Redis**: Session management and caching
- **File Storage**: Supabase storage for user avatars, audio files

## Communication Patterns
- **Synchronous**: REST APIs between services
- **Asynchronous**: WebSocket for real-time features
- **Message Queue**: Redis for inter-service communication

## Security
- JWT tokens for authentication
- Service-to-service authentication via API keys
- Rate limiting per service
- CORS configuration

## Deployment
- Docker containers for each service
- Docker Compose for local development
- Kubernetes for production
- Nginx for load balancing and SSL