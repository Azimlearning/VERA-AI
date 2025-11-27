#!/bin/bash
# Deploy all required Cloud Functions for Agent Try Pages

echo "🚀 Deploying Cloud Functions for Agent Try Pages..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
echo "Checking Firebase login status..."
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run: firebase login"
    exit 1
fi

echo "✅ Firebase CLI ready"
echo ""

# Deploy functions one by one
echo "1️⃣  Deploying generatePodcast..."
firebase deploy --only functions:generatePodcast
if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy generatePodcast"
    exit 1
fi

echo ""
echo "2️⃣  Deploying submitStory..."
firebase deploy --only functions:submitStory
if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy submitStory"
    exit 1
fi

echo ""
echo "3️⃣  Deploying analyzeImage..."
firebase deploy --only functions:analyzeImage
if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy analyzeImage"
    exit 1
fi

echo ""
echo "4️⃣  Deploying generateQuiz..."
firebase deploy --only functions:generateQuiz
if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy generateQuiz"
    exit 1
fi

echo ""
echo "✅ All functions deployed successfully!"
echo ""
echo "📋 Function URLs:"
firebase functions:list | grep -E "(generatePodcast|submitStory|analyzeImage|generateQuiz)"
echo ""
echo "🎉 Deployment complete! Your Agent Try Pages are ready to use."

