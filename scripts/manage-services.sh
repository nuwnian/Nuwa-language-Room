#!/bin/bash

# Nuwa Language Room - Service Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_help() {
    echo "Nuwa Language Room - Service Management"
    echo ""
    echo "Usage: $0 [COMMAND] [SERVICE]"
    echo ""
    echo "Commands:"
    echo "  start [service]     Start all services or specific service"
    echo "  stop [service]      Stop all services or specific service"
    echo "  restart [service]   Restart all services or specific service"
    echo "  logs [service]      Show logs for all services or specific service"
    echo "  status             Show status of all services"
    echo "  health             Check health of all services"
    echo "  scale SERVICE N    Scale service to N instances"
    echo "  update [service]   Update and restart service"
    echo "  clean              Clean up containers and volumes"
    echo "  backup             Backup important data"
    echo ""
    echo "Services:"
    echo "  api-gateway, user-service, chat-service, ai-service,"
    echo "  notification-service, frontend, redis, prometheus, grafana"
    echo ""
    echo "Examples:"
    echo "  $0 start                    # Start all services"
    echo "  $0 restart user-service     # Restart user service"
    echo "  $0 logs chat-service        # Show chat service logs"
    echo "  $0 scale ai-service 3       # Scale AI service to 3 instances"
}

COMPOSE_FILE="docker-compose.microservices.yml"

case $1 in
    "start")
        if [ -n "$2" ]; then
            print_status "Starting $2 service..."
            docker-compose -f $COMPOSE_FILE start "$2"
        else
            print_status "Starting all services..."
            docker-compose -f $COMPOSE_FILE start
        fi
        ;;
    
    "stop")
        if [ -n "$2" ]; then
            print_status "Stopping $2 service..."
            docker-compose -f $COMPOSE_FILE stop "$2"
        else
            print_status "Stopping all services..."
            docker-compose -f $COMPOSE_FILE stop
        fi
        ;;
    
    "restart")
        if [ -n "$2" ]; then
            print_status "Restarting $2 service..."
            docker-compose -f $COMPOSE_FILE restart "$2"
        else
            print_status "Restarting all services..."
            docker-compose -f $COMPOSE_FILE restart
        fi
        ;;
    
    "logs")
        if [ -n "$2" ]; then
            print_status "Showing logs for $2 service..."
            docker-compose -f $COMPOSE_FILE logs -f "$2"
        else
            print_status "Showing logs for all services..."
            docker-compose -f $COMPOSE_FILE logs -f
        fi
        ;;
    
    "status")
        print_status "Service status:"
        docker-compose -f $COMPOSE_FILE ps
        ;;
    
    "health")
        print_status "Checking service health..."
        services=("api-gateway" "user-service" "chat-service" "ai-service" "notification-service" "frontend" "redis")
        
        for service in "${services[@]}"; do
            if docker-compose -f $COMPOSE_FILE ps "$service" | grep -q "Up (healthy)"; then
                echo -e "${GREEN}✅ $service${NC} is healthy"
            elif docker-compose -f $COMPOSE_FILE ps "$service" | grep -q "Up"; then
                echo -e "${YELLOW}⚠️ $service${NC} is running but not healthy"
            else
                echo -e "${RED}❌ $service${NC} is not running"
            fi
        done
        ;;
    
    "scale")
        if [ -z "$2" ] || [ -z "$3" ]; then
            print_error "Usage: $0 scale SERVICE NUMBER"
            exit 1
        fi
        print_status "Scaling $2 to $3 instances..."
        docker-compose -f $COMPOSE_FILE up -d --scale "$2=$3"
        ;;
    
    "update")
        if [ -n "$2" ]; then
            print_status "Updating $2 service..."
            docker-compose -f $COMPOSE_FILE build "$2"
            docker-compose -f $COMPOSE_FILE up -d "$2"
        else
            print_status "Updating all services..."
            docker-compose -f $COMPOSE_FILE build
            docker-compose -f $COMPOSE_FILE up -d
        fi
        ;;
    
    "clean")
        print_status "Cleaning up containers and images..."
        docker-compose -f $COMPOSE_FILE down -v
        docker system prune -f
        print_status "Cleanup completed"
        ;;
    
    "backup")
        print_status "Creating backup..."
        timestamp=$(date +%Y%m%d_%H%M%S)
        backup_dir="backups/backup_$timestamp"
        mkdir -p "$backup_dir"
        
        # Backup Redis data
        docker exec nuwa-redis redis-cli BGSAVE
        docker cp nuwa-redis:/data/dump.rdb "$backup_dir/redis_dump.rdb"
        
        # Backup configuration files
        cp .env.microservices "$backup_dir/"
        cp $COMPOSE_FILE "$backup_dir/"
        
        print_status "Backup created at $backup_dir"
        ;;
    
    "help"|"-h"|"--help"|"")
        print_help
        ;;
    
    *)
        print_error "Unknown command: $1"
        print_help
        exit 1
        ;;
esac