#!/bin/bash

# Nuwa Language Room - Microservices Deployment Script

set -e

echo "🚀 Starting Nuwa Language Room Microservices Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
    print_error "Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Check for environment file
if [ ! -f ".env.microservices" ]; then
    print_warning ".env.microservices file not found. Creating from template..."
    if [ -f ".env.microservices.example" ]; then
        cp .env.microservices.example .env.microservices
        print_warning "Please edit .env.microservices with your actual values before proceeding."
        exit 1
    else
        print_error "No environment template found. Please create .env.microservices file."
        exit 1
    fi
fi

# Create networks if they don't exist
print_status "Creating Docker networks..."
docker network create nuwa-network 2>/dev/null || true

# Pull latest images (optional)
if [ "$1" = "--pull" ]; then
    print_status "Pulling latest base images..."
    docker-compose -f docker-compose.microservices.yml pull
fi

# Build and start services
print_status "Building and starting microservices..."
if [ "$1" = "--build" ] || [ "$2" = "--build" ]; then
    docker-compose -f docker-compose.microservices.yml up --build -d
else
    docker-compose -f docker-compose.microservices.yml up -d
fi

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 10

# Check service health
services=("api-gateway" "user-service" "chat-service" "ai-service" "frontend" "redis")
all_healthy=true

for service in "${services[@]}"; do
    if docker-compose -f docker-compose.microservices.yml ps "$service" | grep -q "Up (healthy)"; then
        print_status "✅ $service is healthy"
    else
        print_warning "⚠️ $service is not healthy yet"
        all_healthy=false
    fi
done

if [ "$all_healthy" = true ]; then
    print_status "🎉 All services are running successfully!"
    echo ""
    echo -e "${BLUE}Service URLs:${NC}"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔐 API Gateway: http://localhost"
    echo "👤 User Service: http://localhost:3001/health"
    echo "💬 Chat Service: http://localhost:3002/health"
    echo "🤖 AI Service: http://localhost:8001/health"
    echo "🔔 Notification Service: http://localhost:3003/health"
    echo "📊 Prometheus: http://localhost:9090"
    echo "📈 Grafana: http://localhost:3010 (admin/admin)"
    echo ""
    echo -e "${GREEN}Deployment completed successfully!${NC}"
else
    print_warning "Some services are not healthy yet. Check logs with:"
    echo "docker-compose -f docker-compose.microservices.yml logs [service-name]"
fi

# Show running containers
echo ""
print_status "Running containers:"
docker-compose -f docker-compose.microservices.yml ps