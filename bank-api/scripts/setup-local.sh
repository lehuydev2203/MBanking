#!/bin/bash

echo "🚀 Setting up Banking API for Local Development..."

# Check if .env exists, if not copy from env.sample
if [ ! -f .env ]; then
    echo "📋 Creating .env file from env.sample..."
    cp env.sample .env
    echo "✅ .env file created with local MongoDB configuration."
else
    echo "✅ .env file already exists."
fi

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Build the project
echo "🔨 Building the project..."
yarn build

# Check MongoDB connection
echo "🔍 Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    echo "Testing MongoDB connection..."
    mongosh --eval "db.adminCommand('ping')" --quiet
    if [ $? -eq 0 ]; then
        echo "✅ MongoDB is running and accessible"
    else
        echo "❌ MongoDB connection failed. Please make sure MongoDB is running on localhost:27017"
        exit 1
    fi
else
    echo "⚠️  mongosh not found. Please make sure MongoDB is running on localhost:27017"
fi

# Run superadmin seeder
echo "👤 Creating super admin account..."
yarn seed:superadmin

echo "🎉 Local setup completed!"
echo ""
echo "📋 Super Admin Account:"
echo "   Email: lehuydev@example.com"
echo "   Password: 123456"
echo ""
echo "🔗 Services:"
echo "   API: http://localhost:1403"
echo "   MongoDB: mongodb://localhost:27017/banking"
echo "   Database: banking (will be created automatically)"
echo ""
echo "🚀 To start the API server:"
echo "   yarn start:dev"
echo ""
echo "📊 To view MongoDB data:"
echo "   Open MongoDB Compass and connect to mongodb://localhost:27017"
