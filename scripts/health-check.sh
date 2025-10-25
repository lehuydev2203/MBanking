#!/bin/bash

# Banking App Health Check Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Function to check HTTP endpoint
check_http() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        print_status "$name is healthy ($url)"
        return 0
    else
        print_error "$name is not responding ($url)"
        return 1
    fi
}

# Function to check Docker container
check_container() {
    local container_name=$1
    local service_name=$2
    
    if docker ps --format "table {{.Names}}" | grep -q "^$container_name$"; then
        local status=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep "$container_name" | awk '{print $2}')
        if [[ $status == *"Up"* ]]; then
            print_status "$service_name container is running"
            return 0
        else
            print_error "$service_name container is not healthy: $status"
            return 1
        fi
    else
        print_error "$service_name container is not running"
        return 1
    fi
}

print_header "🏥 Banking App Health Check"
echo ""

# Check Docker containers
print_header "📦 Container Status"
check_container "banking-mongo" "MongoDB"
check_container "banking-mailhog" "MailHog"
check_container "banking-api" "Backend API"
check_container "banking-fe" "Frontend"
check_container "banking-ngrok" "Ngrok"

echo ""

# Check HTTP endpoints
print_header "🌐 HTTP Endpoints"
check_http "http://localhost:1403/health" "Backend API"
check_http "http://localhost:2203/health" "Frontend"
check_http "http://localhost:8025" "MailHog Web UI"
check_http "http://localhost:4040" "Ngrok Dashboard"

echo ""

# Check Ngrok tunnel
print_header "🌍 Ngrok Tunnel"
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -n "$NGROK_URL" ]; then
    if check_http "$NGROK_URL" "Ngrok Public URL"; then
        print_status "Public URL: $NGROK_URL"
    fi
else
    print_warning "Ngrok tunnel not found or not active"
fi

echo ""

# Check database connection
print_header "🗄️ Database Connection"
if docker-compose exec -T mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    print_status "MongoDB connection is healthy"
else
    print_error "MongoDB connection failed"
fi

echo ""

# Summary
print_header "📊 Summary"
TOTAL_CHECKS=8
PASSED_CHECKS=0

# Count passed checks (simplified)
if check_container "banking-mongo" "MongoDB" > /dev/null 2>&1; then ((PASSED_CHECKS++)); fi
if check_container "banking-api" "Backend API" > /dev/null 2>&1; then ((PASSED_CHECKS++)); fi
if check_container "banking-fe" "Frontend" > /dev/null 2>&1; then ((PASSED_CHECKS++)); fi
if check_container "banking-ngrok" "Ngrok" > /dev/null 2>&1; then ((PASSED_CHECKS++)); fi
if check_http "http://localhost:1403/health" "Backend API" > /dev/null 2>&1; then ((PASSED_CHECKS++)); fi
if check_http "http://localhost:2203/health" "Frontend" > /dev/null 2>&1; then ((PASSED_CHECKS++)); fi
if check_http "http://localhost:8025" "MailHog Web UI" > /dev/null 2>&1; then ((PASSED_CHECKS++)); fi
if check_http "http://localhost:4040" "Ngrok Dashboard" > /dev/null 2>&1; then ((PASSED_CHECKS++)); fi

echo "Health Score: $PASSED_CHECKS/$TOTAL_CHECKS"

if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ]; then
    print_status "🎉 All systems are healthy!"
    exit 0
elif [ $PASSED_CHECKS -ge 6 ]; then
    print_warning "⚠️  Most systems are healthy, some issues detected"
    exit 1
else
    print_error "❌ Multiple systems are down, check logs"
    exit 2
fi
