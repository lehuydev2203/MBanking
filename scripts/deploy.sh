#!/bin/bash

# Banking App Deployment Script
set -e

echo "🚀 Starting Banking App Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from example..."
    cp env.example .env
    print_warning "Please update .env file with your actual values before running again."
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
if [ -z "$NGROK_AUTHTOKEN" ] || [ "$NGROK_AUTHTOKEN" = "your-ngrok-auth-token-here" ]; then
    print_error "NGROK_AUTHTOKEN is not set in .env file"
    exit 1
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans

# Build and start services
print_status "Building and starting services..."
docker-compose up -d --build

# Wait for services to be healthy
print_status "Waiting for services to be ready..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check MongoDB
if docker-compose exec -T mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    print_status "✅ MongoDB is healthy"
else
    print_error "❌ MongoDB is not responding"
    exit 1
fi

# Check API
if curl -f http://localhost:1403/health > /dev/null 2>&1; then
    print_status "✅ API is healthy"
else
    print_error "❌ API is not responding"
    exit 1
fi

# Check Frontend
if curl -f http://localhost:2203/health > /dev/null 2>&1; then
    print_status "✅ Frontend is healthy"
else
    print_error "❌ Frontend is not responding"
    exit 1
fi

# Get Ngrok URL
print_status "Getting Ngrok public URL..."
sleep 5
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -n "$NGROK_URL" ]; then
    print_status "✅ Ngrok tunnel is active: $NGROK_URL"
else
    print_warning "⚠️  Could not get Ngrok URL. Check http://localhost:4040"
fi

print_status "🎉 Deployment completed successfully!"
print_status "📱 Frontend: http://localhost:2203"
print_status "🔧 API: http://localhost:1403"
print_status "📧 MailHog: http://localhost:8025"
print_status "🌐 Ngrok: http://localhost:4040"
if [ -n "$NGROK_URL" ]; then
    print_status "🌍 Public URL: $NGROK_URL"
fi
