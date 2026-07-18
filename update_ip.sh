#!/bin/bash
# update_ip.sh - Update the API URL to match your current IP

# Get your current IP address
IP=\

# Update all API_URL references
find src -name "*.tsx" -exec sed -i '' "s/10\.[0-9]*\.[0-9]*\.[0-9]*:8000/\/g" {} \;

echo "✅ Updated API URL to: \"
