#!/bin/bash

# ============================================================
# TP Extractor - Luxembourg Transfer Pricing Analysis Tool
# Development Environment Setup Script
# ============================================================

set -e

echo "=========================================="
echo "  TP Extractor - Development Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js version must be 18 or higher.${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi
echo -e "${GREEN}Node.js $(node -v) detected${NC}"

# Check npm
echo ""
echo "Checking npm..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}npm $(npm -v) detected${NC}"

# Check for ANTHROPIC_API_KEY
echo ""
echo "Checking environment variables..."
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -e "${YELLOW}Warning: ANTHROPIC_API_KEY not set in environment.${NC}"
    echo "You can set it in .env.local file or export it before running the app."
    echo ""
    echo "To set it:"
    echo "  export ANTHROPIC_API_KEY=your_api_key_here"
    echo "  OR create .env.local file with: ANTHROPIC_API_KEY=your_api_key_here"
else
    echo -e "${GREEN}ANTHROPIC_API_KEY is set${NC}"
fi

# Navigate to tp-extractor directory if it exists
if [ -d "tp-extractor" ]; then
    cd tp-extractor
    echo ""
    echo "Changed to tp-extractor directory"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo ""
    echo "Creating .env.local template..."
    echo "# Anthropic API Key for Claude" > .env.local
    echo "ANTHROPIC_API_KEY=your_api_key_here" >> .env.local
    echo -e "${YELLOW}Please update .env.local with your Anthropic API key${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}  Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "The application will be available at:"
echo -e "  ${GREEN}http://localhost:3000${NC}"
echo ""
echo "Features:"
echo "  - Upload Luxembourg annual accounts (PDF)"
echo "  - AI-powered financial data extraction"
echo "  - Transfer pricing opportunity analysis"
echo "  - Excel/JSON export"
echo ""
echo "=========================================="
