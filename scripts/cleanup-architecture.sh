#!/bin/bash

# Nuwa Language Room - Architecture Cleanup Execution Script
# This script removes duplicate and obsolete files to clean the architecture

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[CLEANUP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "MICROSERVICES_ARCHITECTURE.md" ]; then
    print_error "Please run this script from the Nuwa Language Room root directory"
    exit 1
fi

echo "🧹 Nuwa Language Room Architecture Cleanup"
echo "=========================================="

# Check for --execute flag
if [ "$1" != "--execute" ]; then
    echo -e "${YELLOW}DRY RUN MODE${NC} - Use --execute to actually remove files"
    echo ""
    echo "This script will clean up the following duplicate/obsolete files:"
    echo ""
    
    # Show what would be removed
    echo "📁 Root frontend files (OLD monolithic structure):"
    [ -d "src" ] && echo "   - src/"
    [ -f "App.js" ] && echo "   - App.js"
    [ -f "package.json" ] && echo "   - package.json (root)"
    [ -f "package-lock.json" ] && echo "   - package-lock.json (root)"
    [ -f "index.html" ] && echo "   - index.html (root)"
    [ -f "tailwind.config.js" ] && echo "   - tailwind.config.js (root)"
    [ -f "vite.config.js" ] && echo "   - vite.config.js (root)"
    [ -f "postcss.config.js" ] && echo "   - postcss.config.js (root)"
    [ -f "eslint.config.js" ] && echo "   - eslint.config.js (root)"
    [ -d "public" ] && echo "   - public/ (root)"
    
    echo ""
    echo "📁 Legacy services:"
    [ -d "ai-service" ] && echo "   - ai-service/"
    [ -d "consolidated-service" ] && echo "   - consolidated-service/"
    [ -d "backend" ] && echo "   - backend/"
    [ -d "node-backend" ] && echo "   - node-backend/"
    
    echo ""
    echo "📄 Legacy configuration:"
    [ -f "docker-compose.yml" ] && echo "   - docker-compose.yml"
    [ -f "project-structure.md" ] && echo "   - project-structure.md"
    
    echo ""
    echo -e "${GREEN}✅ Files that will be KEPT:${NC}"
    echo "   - api-gateway/"
    echo "   - user-service/"
    echo "   - chat-service/"
    echo "   - enhanced-ai-service/"
    echo "   - frontend/"
    echo "   - docker-compose.microservices.yml"
    echo "   - MICROSERVICES_ARCHITECTURE.md"
    echo "   - scripts/"
    echo "   - .env files"
    echo ""
    echo "Run with --execute to perform the cleanup"
    exit 0
fi

# Actual cleanup execution
echo "⚠️  EXECUTING CLEANUP - This will permanently delete files!"
echo ""

# Create backup first
timestamp=$(date +%Y%m%d_%H%M%S)
backup_dir="cleanup_backup_$timestamp"
print_status "Creating backup at $backup_dir"
mkdir -p "$backup_dir"

# Backup files before deletion
[ -d "src" ] && cp -r src "$backup_dir/" 2>/dev/null
[ -f "App.js" ] && cp App.js "$backup_dir/" 2>/dev/null
[ -f "package.json" ] && cp package.json "$backup_dir/" 2>/dev/null
[ -f "docker-compose.yml" ] && cp docker-compose.yml "$backup_dir/" 2>/dev/null

print_status "Backup created successfully"

# Stop any running containers from old compose
if [ -f "docker-compose.yml" ]; then
    print_status "Stopping legacy containers..."
    docker-compose -f docker-compose.yml down 2>/dev/null || true
fi

# Remove root frontend files (OLD monolithic structure)
print_status "Removing old monolithic frontend files..."
[ -d "src" ] && rm -rf src && echo "   ✅ Removed src/"
[ -f "App.js" ] && rm -f App.js && echo "   ✅ Removed App.js"
[ -f "package.json" ] && rm -f package.json && echo "   ✅ Removed package.json (root)"
[ -f "package-lock.json" ] && rm -f package-lock.json && echo "   ✅ Removed package-lock.json (root)"
[ -f "index.html" ] && rm -f index.html && echo "   ✅ Removed index.html (root)"
[ -f "tailwind.config.js" ] && rm -f tailwind.config.js && echo "   ✅ Removed tailwind.config.js (root)"
[ -f "vite.config.js" ] && rm -f vite.config.js && echo "   ✅ Removed vite.config.js (root)"
[ -f "postcss.config.js" ] && rm -f postcss.config.js && echo "   ✅ Removed postcss.config.js (root)"
[ -f "eslint.config.js" ] && rm -f eslint.config.js && echo "   ✅ Removed eslint.config.js (root)"
[ -d "public" ] && rm -rf public && echo "   ✅ Removed public/ (root)"

# Remove legacy services
print_status "Removing legacy services..."
[ -d "ai-service" ] && rm -rf ai-service && echo "   ✅ Removed ai-service/"
[ -d "consolidated-service" ] && rm -rf consolidated-service && echo "   ✅ Removed consolidated-service/"
[ -d "backend" ] && rm -rf backend && echo "   ✅ Removed backend/"
[ -d "node-backend" ] && rm -rf node-backend && echo "   ✅ Removed node-backend/"

# Remove legacy configuration
print_status "Removing legacy configuration files..."
[ -f "docker-compose.yml" ] && rm -f docker-compose.yml && echo "   ✅ Removed docker-compose.yml"
[ -f "project-structure.md" ] && rm -f project-structure.md && echo "   ✅ Removed project-structure.md"

# Clean up node_modules in root (if any)
if [ -d "node_modules" ]; then
    print_status "Removing root node_modules..."
    rm -rf node_modules
    echo "   ✅ Removed node_modules (root)"
fi

# Rename microservices compose file to be the main one
if [ -f "docker-compose.microservices.yml" ]; then
    print_status "Setting up main docker-compose configuration..."
    cp docker-compose.microservices.yml docker-compose.yml
    echo "   ✅ Created docker-compose.yml from microservices version"
fi

# Update .gitignore to reflect new structure
print_status "Updating .gitignore for microservices architecture..."
cat > .gitignore << EOF
# Dependencies
node_modules/
*/node_modules/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python

# Environment variables
.env
.env.local
.env.development
.env.production
.env.microservices.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Build outputs
dist/
build/
*/dist/
*/build/

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Docker
.docker/

# Temporary files
*.tmp
*.temp

# Backup files
*_backup_*
cleanup_backup_*

# Service-specific ignores
user-service/.env
chat-service/.env
enhanced-ai-service/.env
api-gateway/.env
notification-service/.env
frontend/.env

# Monitoring data
monitoring/data/
EOF

print_status "Updated .gitignore"

echo ""
echo -e "${GREEN}🎉 Cleanup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 CLEANUP SUMMARY:${NC}"
echo "✅ Removed old monolithic frontend structure"
echo "✅ Removed legacy backend services" 
echo "✅ Removed duplicate configuration files"
echo "✅ Created unified docker-compose.yml"
echo "✅ Updated .gitignore for microservices"
echo "✅ Created backup at $backup_dir/"
echo ""
echo -e "${GREEN}🏗️  CLEAN ARCHITECTURE NOW READY:${NC}"
echo "📁 api-gateway/           - Nginx API Gateway"
echo "📁 user-service/          - Authentication & User Management"
echo "📁 chat-service/          - Real-time Messaging"
echo "📁 enhanced-ai-service/   - AI Language Processing"
echo "📁 frontend/              - React Frontend"
echo "📁 scripts/               - Management Scripts"
echo "📄 docker-compose.yml     - Unified Orchestration"
echo ""
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo "1. Deploy microservices: ./scripts/deploy-microservices.sh --build"
echo "2. Manage services: ./scripts/manage-services.sh status"
echo "3. Configure environment: cp .env.microservices .env.local"
echo ""
echo -e "${GREEN}Your architecture is now clean and ready for production! 🚀${NC}"