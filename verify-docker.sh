#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Verifying Docker setup for booking-poc..."
echo ""

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is installed${NC}"

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose is installed${NC}"

echo ""
echo "📁 Checking Docker files..."

# Check for docker-compose files
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ docker-compose.yml not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ docker-compose.yml found${NC}"

if [ ! -f "docker-compose.dev.yml" ]; then
    echo -e "${YELLOW}⚠️  docker-compose.dev.yml not found${NC}"
else
    echo -e "${GREEN}✅ docker-compose.dev.yml found${NC}"
fi

# Check for Dockerfiles
if [ ! -f "packages/backend/Dockerfile" ]; then
    echo -e "${RED}❌ Backend Dockerfile not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend Dockerfile found${NC}"

if [ ! -f "packages/frontend/Dockerfile" ]; then
    echo -e "${RED}❌ Frontend Dockerfile not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend Dockerfile found${NC}"

# Check for .dockerignore files
if [ ! -f ".dockerignore" ]; then
    echo -e "${YELLOW}⚠️  Root .dockerignore not found${NC}"
else
    echo -e "${GREEN}✅ Root .dockerignore found${NC}"
fi

if [ ! -f "packages/backend/.dockerignore" ]; then
    echo -e "${YELLOW}⚠️  Backend .dockerignore not found${NC}"
else
    echo -e "${GREEN}✅ Backend .dockerignore found${NC}"
fi

if [ ! -f "packages/frontend/.dockerignore" ]; then
    echo -e "${YELLOW}⚠️  Frontend .dockerignore not found${NC}"
else
    echo -e "${GREEN}✅ Frontend .dockerignore found${NC}"
fi

# Check for .env file
echo ""
echo "🔐 Checking environment..."
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo -e "${YELLOW}   Create one based on .env.example${NC}"
else
    echo -e "${GREEN}✅ .env file found${NC}"
fi

# Check for shared package
echo ""
echo "📦 Checking shared package..."
if [ ! -f "packages/shared/package.json" ]; then
    echo -e "${RED}❌ Shared package not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Shared package found${NC}"

# Validate docker-compose.yml
echo ""
echo "🔍 Validating docker-compose.yml..."
if docker-compose config > /dev/null 2>&1; then
    echo -e "${GREEN}✅ docker-compose.yml is valid${NC}"
else
    echo -e "${RED}❌ docker-compose.yml has errors${NC}"
    exit 1
fi

# Validate docker-compose.dev.yml
if [ -f "docker-compose.dev.yml" ]; then
    echo "🔍 Validating docker-compose.dev.yml..."
    if docker-compose -f docker-compose.dev.yml config > /dev/null 2>&1; then
        echo -e "${GREEN}✅ docker-compose.dev.yml is valid${NC}"
    else
        echo -e "${RED}❌ docker-compose.dev.yml has errors${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}🎉 All Docker configuration checks passed!${NC}"
echo ""
echo "📝 Next steps:"
echo "   1. Create .env file if not exists (copy from .env.example)"
echo "   2. Start services:"
echo "      - Production: docker-compose up"
echo "      - Development: docker-compose -f docker-compose.dev.yml up"
echo ""
