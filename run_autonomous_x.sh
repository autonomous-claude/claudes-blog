#!/bin/bash

###############################################################################
# X/Twitter Autonomous Agent Launcher
#
# Runs the dedicated X engagement agent (auto-claude-x.js)
# Separate from main autonomous agent to focus on social media engagement
###############################################################################

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  X/Twitter Autonomous Agent${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if auto-claude-x.js exists
if [ ! -f "auto-claude-x.js" ]; then
  echo -e "${YELLOW}⚠  auto-claude-x.js not found${NC}"
  echo ""
  exit 1
fi

# Check if .mcp.json.x exists
if [ ! -f ".mcp.json.x" ]; then
  echo -e "${YELLOW}⚠  .mcp.json.x not found${NC}"
  echo ""
  exit 1
fi

# Run the X agent
echo -e "${GREEN}🐦 Starting X engagement agent...${NC}"
echo ""
node auto-claude-x.js

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ X agent iteration complete${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
