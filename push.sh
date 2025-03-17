#!/bin/bash

# Delay execution by 3 seconds
sleep 3

# Check if a commit message is provided
if [ -z "$1" ]; then
  echo "Error: No commit message provided."
  echo "Usage: ./push.sh \"Your commit message\""
  exit 1
fi

# Add all changes
git add .

# Commit with the provided message
git commit -m "$1"

# Push to the main branch
git push origin main

echo "Git push completed successfully!"
