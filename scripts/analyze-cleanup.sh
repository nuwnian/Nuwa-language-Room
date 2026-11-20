#!/bin/bash

# Nuwa Language Room - Architecture Cleanup Script
# This script identifies duplicate/unnecessary files and suggests cleanups

set -e

echo "🧹 Nuwa Language Room Architecture Cleanup Analysis"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_section() {
    echo -e "\n${BLUE}📂 $1${NC}"
    echo "----------------------------------------"
}

print_duplicate() {
    echo -e "${YELLOW}🔄 DUPLICATE:${NC} $1"
}

print_obsolete() {
    echo -e "${RED}🗑️  OBSOLETE:${NC} $1"
}

print_keep() {
    echo -e "${GREEN}✅ KEEP:${NC} $1"
}

print_section "FRONTEND FILES ANALYSIS"

echo "Current structure has DUPLICATE frontend implementations:"
print_duplicate "Root frontend files (src/, package.json, index.html) - OLD monolithic structure"
print_duplicate "frontend/ directory - NEW microservices structure"
print_duplicate "App.js in root - OLD version without Lucide icons"
print_duplicate "src/App.jsx - NEW version with Lucide icons and better UX"

echo -e "\n${YELLOW}RECOMMENDATION:${NC}"
print_keep "frontend/ directory (microservices)"
print_obsolete "Root: src/, package.json, index.html, App.js, tailwind.config.js, vite.config.js, etc."

print_section "BACKEND/AI SERVICES ANALYSIS"

echo "Multiple AI service implementations found:"
print_duplicate "ai-service/ - Original basic AI service"
print_duplicate "enhanced-ai-service/ - NEW comprehensive AI service with OpenAI"
print_duplicate "consolidated-service/ - Legacy consolidated service"
print_duplicate "backend/ - Legacy Python backend"
print_duplicate "node-backend/ - Legacy Node backend"

echo -e "\n${YELLOW}RECOMMENDATION:${NC}"
print_keep "enhanced-ai-service/ (comprehensive OpenAI integration)"
print_keep "user-service/ (dedicated auth service)"
print_keep "chat-service/ (real-time messaging)"
print_obsolete "ai-service/, consolidated-service/, backend/, node-backend/"

print_section "DOCKER COMPOSE ANALYSIS"

echo "Multiple Docker configurations found:"
print_duplicate "docker-compose.yml - Legacy 3-service setup"
print_duplicate "docker-compose.microservices.yml - NEW comprehensive microservices"

echo -e "\n${YELLOW}RECOMMENDATION:${NC}"
print_keep "docker-compose.microservices.yml (comprehensive setup)"
print_obsolete "docker-compose.yml (legacy)"

print_section "DOCUMENTATION ANALYSIS"

echo "Multiple documentation files found:"
print_keep "MICROSERVICES_ARCHITECTURE.md - Architecture overview"
print_keep "README.md - Main project documentation"
print_obsolete "project-structure.md - Outdated structure documentation"
print_obsolete "MICROSERVICES_README.md - Duplicate (if exists)"

print_section "SUMMARY OF CLEANUP ACTIONS"

echo -e "\n${RED}FILES TO REMOVE (Obsolete/Duplicate):${NC}"
echo "📁 Root frontend files:"
echo "   - src/ (entire directory)"
echo "   - App.js"
echo "   - package.json (root)"
echo "   - package-lock.json (root)"
echo "   - index.html (root)"
echo "   - tailwind.config.js (root)"
echo "   - vite.config.js (root)"
echo "   - postcss.config.js (root)"
echo "   - eslint.config.js (root)"
echo "   - public/ (root directory)"
echo ""
echo "📁 Legacy services:"
echo "   - ai-service/"
echo "   - consolidated-service/"
echo "   - backend/"
echo "   - node-backend/"
echo ""
echo "📄 Legacy config:"
echo "   - docker-compose.yml"
echo "   - project-structure.md"

echo -e "\n${GREEN}FILES TO KEEP (Current microservices):${NC}"
echo "📁 Core services:"
echo "   - api-gateway/"
echo "   - user-service/"
echo "   - chat-service/"
echo "   - enhanced-ai-service/"
echo "   - notification-service/ (when created)"
echo ""
echo "📁 Frontend:"
echo "   - frontend/ (microservice version)"
echo ""
echo "📄 Configuration:"
echo "   - docker-compose.microservices.yml"
echo "   - .env.microservices"
echo "   - scripts/"
echo ""
echo "📄 Documentation:"
echo "   - README.md"
echo "   - MICROSERVICES_ARCHITECTURE.md"

echo -e "\n${YELLOW}NEXT STEPS:${NC}"
echo "1. Review this analysis"
echo "2. Backup important data: ./scripts/manage-services.sh backup"
echo "3. Run cleanup: ./scripts/cleanup-architecture.sh --execute"
echo "4. Test microservices: ./scripts/deploy-microservices.sh --build"

echo -e "\n${BLUE}💡 TIP:${NC} This cleanup will reduce project size and eliminate confusion"
echo "between old monolithic and new microservices architecture."