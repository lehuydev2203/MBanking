#!/bin/bash

# Banking App Logs Script
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

print_help() {
    echo -e "${BLUE}Banking App Logs Viewer${NC}"
    echo ""
    echo "Usage: $0 [service] [options]"
    echo ""
    echo "Services:"
    echo "  api      - Backend API logs"
    echo "  fe       - Frontend logs"
    echo "  mongo    - MongoDB logs"
    echo "  mailhog  - MailHog logs"
    echo "  ngrok    - Ngrok logs"
    echo "  all      - All services logs (default)"
    echo ""
    echo "Options:"
    echo "  -f, --follow    Follow log output"
    echo "  -t, --tail      Number of lines to show (default: 100)"
    echo "  -h, --help      Show this help"
    echo ""
    echo "Examples:"
    echo "  $0                    # Show all logs"
    echo "  $0 api -f             # Follow API logs"
    echo "  $0 fe -t 50           # Show last 50 lines of frontend logs"
}

# Default values
SERVICE="all"
FOLLOW=false
TAIL_LINES=100

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -t|--tail)
            TAIL_LINES="$2"
            shift 2
            ;;
        -h|--help)
            print_help
            exit 0
            ;;
        api|fe|mongo|mailhog|ngrok|all)
            SERVICE="$1"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            print_help
            exit 1
            ;;
    esac
done

# Build docker-compose command
if [ "$FOLLOW" = true ]; then
    COMPOSE_CMD="docker-compose logs -f --tail=$TAIL_LINES"
else
    COMPOSE_CMD="docker-compose logs --tail=$TAIL_LINES"
fi

# Execute based on service
case $SERVICE in
    api)
        print_status "Showing API logs..."
        $COMPOSE_CMD banking-api
        ;;
    fe)
        print_status "Showing Frontend logs..."
        $COMPOSE_CMD banking-fe
        ;;
    mongo)
        print_status "Showing MongoDB logs..."
        $COMPOSE_CMD mongo
        ;;
    mailhog)
        print_status "Showing MailHog logs..."
        $COMPOSE_CMD mailhog
        ;;
    ngrok)
        print_status "Showing Ngrok logs..."
        $COMPOSE_CMD ngrok
        ;;
    all)
        print_status "Showing all services logs..."
        $COMPOSE_CMD
        ;;
esac
