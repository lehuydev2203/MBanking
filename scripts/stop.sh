#!/bin/bash

# Banking App Stop Script
set -e

echo "🛑 Stopping Banking App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Stop all services
print_status "Stopping all services..."
docker-compose down

# Remove orphaned containers
print_status "Removing orphaned containers..."
docker-compose down --remove-orphans

# Optional: Remove volumes (uncomment if you want to reset database)
# print_warning "Removing volumes (this will delete all data)..."
# docker-compose down -v

print_status "✅ All services stopped successfully!"
