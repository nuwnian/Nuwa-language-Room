# Nuwa Language Room - Microservices Architecture

A scalable, production-ready microservices implementation of the Nuwa Language Room language learning platform.

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   Frontend      │ (React + Tailwind CSS)
│   Port: 3000    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   API Gateway   │ (Nginx + Load Balancer)
│   Port: 80/443  │
└─────────────────┘
         │
    ┌────┴────────────────────────────┐
    │                                 │
    ▼                                 ▼
┌─────────────┐                 ┌─────────────┐
│User Service │                 │Chat Service │
│Port: 3001   │                 │Port: 3002   │
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

## 🚀 Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for development)
- Python 3.9+ (for AI service development)

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd nuwa_language_room

# Copy environment template
cp .env.microservices .env.microservices.local

# Edit environment variables
nano .env.microservices.local
```

### 2. Deploy All Services
```bash
# Build and start all services
./scripts/deploy-microservices.sh --build

# Or using Docker Compose directly
docker-compose -f docker-compose.microservices.yml up --build -d
```

### 3. Verify Deployment
```bash
# Check service health
./scripts/manage-services.sh health

# View service status
./scripts/manage-services.sh status
```

## 📋 Services

### 🔐 User Service (Port 3001)
**Technology**: Node.js + Express + Supabase  
**Purpose**: Authentication, user management, profiles

**Endpoints**:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token

### 💬 Chat Service (Port 3002)
**Technology**: Node.js + Express + Socket.io + Supabase  
**Purpose**: Real-time messaging, conversation management

**REST Endpoints**:
- `GET /api/conversations` - List user conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id/messages` - Get conversation messages
- `POST /api/conversations/:id/messages` - Send message

**WebSocket Events**:
- `join_conversation` - Join conversation room
- `send_message` - Send real-time message
- `typing_start/stop` - Typing indicators

### 🤖 AI Service (Port 8001)
**Technology**: Python + FastAPI + OpenAI  
**Purpose**: Language correction, translation, learning recommendations

**Endpoints**:
- `POST /api/ai/correct-text` - Text correction with explanations
- `POST /api/ai/translate` - Text translation
- `POST /api/ai/analyze-language-level` - Language proficiency analysis
- `GET /api/ai/learning-suggestions` - Personalized learning recommendations

### 🔔 Notification Service (Port 3003)
**Technology**: Node.js + Express + Socket.io  
**Purpose**: Real-time notifications, progress tracking

**Endpoints**:
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/send` - Send notification
- WebSocket for real-time push notifications

### 🌐 API Gateway (Port 80/443)
**Technology**: Nginx  
**Purpose**: Request routing, load balancing, SSL termination

**Routes**:
- `/` → Frontend Service
- `/api/auth/*` → User Service
- `/api/chat/*` → Chat Service
- `/api/ai/*` → AI Service
- `/api/notifications/*` → Notification Service
- `/socket.io/*` → Chat Service (WebSocket)

### 🎨 Frontend (Port 3000)
**Technology**: React + Tailwind CSS + Vite  
**Purpose**: User interface and client-side logic

## 🛠️ Service Management

### Using Management Scripts
```bash
# Start all services
./scripts/manage-services.sh start

# Restart specific service
./scripts/manage-services.sh restart ai-service

# View logs
./scripts/manage-services.sh logs chat-service

# Scale service (create multiple instances)
./scripts/manage-services.sh scale ai-service 3

# Check health status
./scripts/manage-services.sh health

# Update and rebuild service
./scripts/manage-services.sh update user-service

# Clean up everything
./scripts/manage-services.sh clean
```

### Direct Docker Compose Commands
```bash
# View all services
docker-compose -f docker-compose.microservices.yml ps

# View logs
docker-compose -f docker-compose.microservices.yml logs -f [service-name]

# Restart service
docker-compose -f docker-compose.microservices.yml restart [service-name]

# Scale service
docker-compose -f docker-compose.microservices.yml up -d --scale ai-service=3

# Stop all services
docker-compose -f docker-compose.microservices.yml down
```

## 🔧 Development

### Local Development Setup
```bash
# Start dependencies only (Redis, databases)
docker-compose -f docker-compose.microservices.yml up redis -d

# Run services individually for development
cd user-service && npm run dev
cd chat-service && npm run dev
cd enhanced-ai-service && uvicorn src.main:app --reload --port 8001
```

### Adding a New Service
1. Create service directory: `mkdir new-service`
2. Add Dockerfile and source code
3. Update `docker-compose.microservices.yml`
4. Add routes to API Gateway (`api-gateway/nginx.conf`)
5. Update management scripts

### Environment Variables
Required variables in `.env.microservices`:
```bash
# Authentication
JWT_SECRET=your-jwt-secret

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## 📊 Monitoring & Observability

### Prometheus Metrics (Port 9090)
- Service health checks
- Request rates and response times
- System resource usage
- Custom business metrics

### Grafana Dashboards (Port 3010)
- Service performance dashboards
- Real-time monitoring
- Alert management
- Custom visualizations

**Default Login**: admin/admin

### Health Checks
All services implement health check endpoints:
- `GET /health` - Basic health status
- Includes database connectivity
- Service-specific metrics
- Dependency status

## 🐳 Docker Configuration

### Service Images
Each service has its own optimized Dockerfile:
- Multi-stage builds for smaller images
- Non-root user for security
- Health checks included
- Proper signal handling

### Networking
- Custom Docker network: `nuwa-network`
- Inter-service communication via service names
- Exposed ports for external access
- Load balancing ready

### Volumes
- `redis_data`: Persistent Redis storage
- `prometheus_data`: Metrics storage
- `grafana_data`: Dashboard configurations

## 🔒 Security Features

- JWT authentication across services
- Rate limiting per service
- CORS configuration
- Security headers via Nginx
- Non-root containers
- Environment variable isolation

## 🚀 Production Deployment

### Using Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.microservices.yml nuwa
```

### Using Kubernetes
```bash
# Convert to Kubernetes (using Kompose)
kompose convert -f docker-compose.microservices.yml

# Apply to cluster
kubectl apply -f .
```

### Cloud Deployment Considerations
- Use managed databases (Supabase, AWS RDS)
- Container orchestration (EKS, GKE, AKS)
- Load balancer instead of Nginx
- Secrets management
- Auto-scaling configuration

## 🧪 Testing

### Unit Tests
```bash
# User Service
cd user-service && npm test

# Chat Service
cd chat-service && npm test

# AI Service
cd enhanced-ai-service && pytest
```

### Integration Tests
```bash
# Test full stack
./scripts/run-integration-tests.sh
```

### Load Testing
```bash
# Test API performance
./scripts/load-test.sh
```

## 📚 API Documentation

- **Swagger/OpenAPI**: Available at each service's `/docs` endpoint
- **User Service**: http://localhost:3001/docs
- **Chat Service**: http://localhost:3002/docs  
- **AI Service**: http://localhost:8001/api/ai/docs

## 🐛 Troubleshooting

### Common Issues

**Services not starting**:
```bash
# Check logs
./scripts/manage-services.sh logs

# Verify environment variables
grep -v "^#" .env.microservices

# Check Docker resources
docker system df
```

**Database connection issues**:
```bash
# Test Supabase connection
curl -H "apikey: YOUR_KEY" "YOUR_SUPABASE_URL/rest/v1/users?limit=1"

# Check Redis
docker exec nuwa-redis redis-cli ping
```

**Performance issues**:
```bash
# Check service resources
docker stats

# Monitor with Grafana
open http://localhost:3010
```

## 📈 Scaling Guidelines

### Horizontal Scaling
- **AI Service**: CPU intensive, scale based on OpenAI rate limits
- **Chat Service**: Memory intensive, scale for concurrent connections
- **User Service**: Scale based on authentication load
- **API Gateway**: Use multiple instances with load balancer

### Vertical Scaling
- Increase container resources in production
- Monitor memory usage per service
- Adjust based on traffic patterns

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes to specific services
4. Test with `./scripts/manage-services.sh health`
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Questions?** Check the [Issues](https://github.com/your-repo/issues) or create a new one for help with the microservices setup.