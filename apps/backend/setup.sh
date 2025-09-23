#!/bin/bash

# AI-Powered Todo App - Backend Setup Script

echo "🚀 Setting up AI-Powered Todo App Backend..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created. Please update it with your API keys."
else
    echo "✅ .env file already exists."
fi

# Create database directory
mkdir -p data

echo "✅ Backend setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Update .env file with your API keys"
echo "2. Run 'pnpm dev' to start the development server"
echo "3. The API will be available at http://localhost:3001"
echo ""
echo "📚 Documentation:"
echo "- API docs: API.md"
echo "- README: README.md"
echo "- Health check: http://localhost:3001/health"
