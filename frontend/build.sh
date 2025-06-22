#!/bin/bash

# Build the React app
npm run build

# Copy _redirects to build directory
cp public/_redirects build/

# Copy serve.json to build directory
cp serve.json build/

echo "Build completed with routing configuration" 