#!/bin/bash

# Test script for chatbot with GPT-4o-mini model
# Usage: ./test-chatbot.sh [endpoint-url] [message] [--debug]

ENDPOINT="${1:-http://localhost:5001/YOUR-PROJECT/us-central1/askChatbot}"
MESSAGE="${2:-What are the key milestones for Net Zero 2050?}"
DEBUG="${3:-}"

if [ "$DEBUG" = "--debug" ] || [ "$DEBUG" = "-d" ]; then
  URL="${ENDPOINT}?debug=true"
else
  URL="${ENDPOINT}"
fi

echo "============================================================"
echo "🧪 Testing Chatbot Endpoint"
echo "============================================================"
echo "📍 Endpoint: $ENDPOINT"
echo "💬 Message: \"$MESSAGE\""
echo "🔍 Debug Mode: $([ -n "$DEBUG" ] && echo "ON" || echo "OFF")"
echo "============================================================"
echo ""

START_TIME=$(date +%s%N)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"$MESSAGE\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

END_TIME=$(date +%s%N)
DURATION=$((($END_TIME - $START_TIME) / 1000000))

echo "✅ Response Status: $HTTP_CODE"
echo "⏱️  Total Duration: ${DURATION}ms"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  
  # Check if primary model is being used
  MODEL=$(echo "$BODY" | jq -r '._debug.model // empty' 2>/dev/null)
  if [ -n "$MODEL" ]; then
    echo ""
    if [ "$MODEL" = "openai/gpt-4o-mini" ]; then
      echo "✅ SUCCESS: Primary model (GPT-4o-mini) is being used!"
    else
      echo "⚠️  WARNING: Using fallback model \"$MODEL\" instead of primary model"
    fi
  fi
else
  echo "❌ Error Response:"
  echo "$BODY"
fi

echo ""

