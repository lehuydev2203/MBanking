# Banking App Makefile
.PHONY: help build up down restart logs health deploy clean

# Default target
help: ## Show this help message
	@echo "Banking App - Docker Management"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## Show logs for all services
	./scripts/logs.sh

logs-api: ## Show API logs
	./scripts/logs.sh api -f

logs-fe: ## Show Frontend logs
	./scripts/logs.sh fe -f

health: ## Check health of all services
	./scripts/health-check.sh

deploy: ## Deploy the entire application
	./scripts/deploy.sh

stop: ## Stop all services
	./scripts/stop.sh

clean: ## Clean up containers, images and volumes
	docker-compose down -v --rmi all
	docker system prune -f

dev: ## Start only database and mailhog for development
	docker-compose up -d mongo mailhog

status: ## Show status of all containers
	docker-compose ps

# Development helpers
install-fe: ## Install frontend dependencies
	cd bank-fe && yarn install

install-api: ## Install backend dependencies
	cd bank-api && yarn install

install: install-fe install-api ## Install all dependencies

# Quick access URLs
urls: ## Show all application URLs
	@echo "🌐 Application URLs:"
	@echo "  Frontend:     http://localhost:2203"
	@echo "  Backend API:  http://localhost:1403"
	@echo "  API Docs:     http://localhost:1403/docs"
	@echo "  MailHog:      http://localhost:8025"
	@echo "  Ngrok:        http://localhost:4040"
	@echo ""
	@echo "🌍 Public URL (if Ngrok is running):"
	@curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | head -1 || echo "  Not available"
