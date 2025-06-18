#!/bin/bash

# SecureGuardian Development Setup Script
# This script sets up the development environment for SecureGuardian

echo "🛡️  Setting up SecureGuardian Development Environment..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Create environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment configuration..."
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please update the .env file with your configuration before starting"
else
    echo "✅ Environment file already exists"
fi
echo ""

# Create logs directory
if [ ! -d "logs" ]; then
    echo "📁 Creating logs directory..."
    mkdir logs
    echo "✅ Logs directory created"
else
    echo "✅ Logs directory already exists"
fi
echo ""

# Install server dependencies
echo "📦 Installing server dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ Server dependencies installed successfully"
else
    echo "❌ Failed to install server dependencies"
    exit 1
fi
echo ""

# Install mobile dependencies
echo "📱 Installing mobile app dependencies..."
cd mobile
npm install
if [ $? -eq 0 ]; then
    echo "✅ Mobile dependencies installed successfully"
else
    echo "❌ Failed to install mobile dependencies"
    exit 1
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📱 Installing Expo CLI globally..."
    npm install -g @expo/cli
    if [ $? -eq 0 ]; then
        echo "✅ Expo CLI installed successfully"
    else
        echo "❌ Failed to install Expo CLI"
        exit 1
    fi
else
    echo "✅ Expo CLI is already installed: $(expo --version)"
fi

cd ..
echo ""

# Check for additional development tools
echo "🔧 Checking development tools..."

# Check for MongoDB (optional)
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB is installed: $(mongod --version | head -n 1)"
else
    echo "⚠️  MongoDB is not installed (optional for local development)"
    echo "   You can install it from https://www.mongodb.com/try/download/community"
fi

# Check for Redis (optional)
if command -v redis-server &> /dev/null; then
    echo "✅ Redis is installed: $(redis-server --version)"
else
    echo "⚠️  Redis is not installed (optional for local development)"
    echo "   You can install it from https://redis.io/download"
fi

echo ""
echo "🎉 SecureGuardian development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Update the .env file with your configuration"
echo "   2. Start the server: npm run dev"
echo "   3. Start the mobile app: npm run client"
echo ""
echo "🔗 Useful commands:"
echo "   • npm run dev           - Start development server"
echo "   • npm run client        - Start mobile app (Expo)"
echo "   • npm run test          - Run tests"
echo "   • npm run lint          - Run linter"
echo "   • npm run format        - Format code"
echo ""
echo "📚 Documentation: https://github.com/yourusername/secureguardian"
echo "🐛 Issues: https://github.com/yourusername/secureguardian/issues"
echo ""
echo "Happy coding! 🚀"
