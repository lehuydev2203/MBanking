#!/bin/bash

echo "🚀 Setting up Banking API..."

# Check if .env exists, if not copy from env.sample
if [ ! -f .env ]; then
    echo "📋 Creating .env file from env.sample..."
    cp env.sample .env
    echo "✅ .env file created. Please review and update the configuration if needed."
else
    echo "✅ .env file already exists."
fi

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Build the project
echo "🔨 Building the project..."
yarn build

# Start MongoDB and other services
echo "🐳 Starting Docker services..."
docker compose up -d mongo mailhog

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 10

# Run superadmin seeder
echo "👤 Creating super admin account..."
yarn seed:superadmin

echo "🎉 Setup completed!"
echo ""
echo "📋 Super Admin Account:"
echo "   Email: lehuydev@example.com"
echo "   Password: 123456"
echo ""
echo "🔗 Services:"
echo "   API: http://localhost:3000"
echo "   MongoDB: mongodb://localhost:27017/banking"
echo "   MailHog: http://localhost:8025"
echo ""
echo "🚀 To start the API server:"
echo "   yarn start:dev"
echo ""
echo "🛑 To stop all services:"
echo "   docker compose down"
