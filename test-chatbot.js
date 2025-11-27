/**
 * Test script for chatbot with GPT-4o-mini model
 * 
 * Usage:
 *   node test-chatbot.js [endpoint-url] [message]
 * 
 * Examples:
 *   node test-chatbot.js https://us-central1-YOUR-PROJECT.cloudfunctions.net/askChatbot "What is Systemic Shift #8?"
 *   node test-chatbot.js http://localhost:5001/YOUR-PROJECT/us-central1/askChatbot "Test question" --debug
 */

// Use native fetch (Node 18+) - no import needed
// For Node < 18, install: npm install node-fetch@2

// Default test endpoint (update with your actual endpoint)
const DEFAULT_ENDPOINT = process.env.CHATBOT_ENDPOINT || 'http://localhost:5001/YOUR-PROJECT/us-central1/askChatbot';

// Test questions
const TEST_QUESTIONS = [
  "What are the key milestones for Net Zero 2050?",
  "What is Systemic Shift #8?",
  "Tell me about Portfolio High-Grading",
  "What are the key metrics for Upstream?"
];

async function testChatbot(endpoint, message, debug = false) {
  const url = debug ? `${endpoint}?debug=true` : endpoint;
  
  console.log('\n' + '='.repeat(80));
  console.log(`🧪 Testing Chatbot Endpoint`);
  console.log('='.repeat(80));
  console.log(`📍 Endpoint: ${endpoint}`);
  console.log(`💬 Message: "${message}"`);
  console.log(`🔍 Debug Mode: ${debug ? 'ON' : 'OFF'}`);
  console.log('='.repeat(80) + '\n');

  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    console.log(`✅ Response Status: ${response.status} ${response.statusText}`);
    console.log(`⏱️  Total Duration: ${duration}ms\n`);

    if (response.ok) {
      console.log('📝 Response:');
      console.log('-'.repeat(80));
      console.log(data.reply || data.error || JSON.stringify(data, null, 2));
      console.log('-'.repeat(80) + '\n');

      if (data.suggestions && data.suggestions.length > 0) {
        console.log('💡 Suggestions:');
        data.suggestions.forEach((suggestion, i) => {
          console.log(`   ${i + 1}. ${suggestion}`);
        });
        console.log('');
      }

      if (data.citations && data.citations.length > 0) {
        console.log('📚 Citations:');
        data.citations.forEach((citation, i) => {
          console.log(`   ${i + 1}. ${citation.title || citation}`);
        });
        console.log('');
      }

      if (data._debug) {
        console.log('🔍 Debug Information:');
        console.log('-'.repeat(80));
        console.log(`   Model: ${data._debug.model}`);
        console.log(`   Model Type: ${data._debug.modelType}`);
        console.log(`   Latency: ${data._debug.latencyMs}ms`);
        console.log(`   Response Length: ${data._debug.responseLength} chars`);
        console.log(`   Prompt Length: ${data._debug.promptLength} chars`);
        if (data._debug.tokens) {
          console.log(`   Tokens: ${data._debug.tokens}`);
        }
        console.log('-'.repeat(80) + '\n');
      } else if (debug) {
        console.log('⚠️  Debug mode requested but no debug info in response');
        console.log('   Make sure CHATBOT_DEBUG=true is set or endpoint supports ?debug=true\n');
      }

      // Verify primary model is being used
      if (data._debug && data._debug.model) {
        const isPrimaryModel = data._debug.model === 'openai/gpt-4o-mini';
        if (isPrimaryModel) {
          console.log('✅ SUCCESS: Primary model (GPT-4o-mini) is being used!\n');
        } else {
          console.log(`⚠️  WARNING: Using fallback model "${data._debug.model}" instead of primary model\n`);
        }
      }

    } else {
      console.error('❌ Error Response:');
      console.error(JSON.stringify(data, null, 2));
    }

    return { success: response.ok, data, duration };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Error after ${duration}ms:`);
    console.error(`   ${error.message}`);
    if (error.stack) {
      console.error(`\nStack trace:\n${error.stack}`);
    }
    return { success: false, error: error.message, duration };
  }
}

async function runAllTests(endpoint, debug = false) {
  console.log('\n' + '🚀'.repeat(40));
  console.log('  RUNNING ALL TESTS');
  console.log('🚀'.repeat(40) + '\n');

  const results = [];

  for (let i = 0; i < TEST_QUESTIONS.length; i++) {
    const question = TEST_QUESTIONS[i];
    console.log(`\n📋 Test ${i + 1}/${TEST_QUESTIONS.length}`);
    
    const result = await testChatbot(endpoint, question, debug);
    results.push({ question, ...result });

    // Wait a bit between tests to avoid rate limiting
    if (i < TEST_QUESTIONS.length - 1) {
      console.log('⏳ Waiting 2 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log('\n' + '📊'.repeat(40));
  console.log('  TEST SUMMARY');
  console.log('📊'.repeat(40) + '\n');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length;

  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`⏱️  Average Duration: ${Math.round(avgDuration)}ms\n`);

  // Model usage summary
  const modelUsage = {};
  results.forEach(r => {
    if (r.data && r.data._debug && r.data._debug.model) {
      const model = r.data._debug.model;
      modelUsage[model] = (modelUsage[model] || 0) + 1;
    }
  });

  if (Object.keys(modelUsage).length > 0) {
    console.log('🤖 Model Usage:');
    Object.entries(modelUsage).forEach(([model, count]) => {
      const isPrimary = model === 'openai/gpt-4o-mini';
      const indicator = isPrimary ? '✅' : '⚠️';
      console.log(`   ${indicator} ${model}: ${count} time(s)`);
    });
    console.log('');
  }

  return results;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const endpoint = args[0] || DEFAULT_ENDPOINT;
  const message = args[1];
  const debug = args.includes('--debug') || args.includes('-d');
  const allTests = args.includes('--all') || args.includes('-a');

  if (allTests || !message) {
    // Run all tests
    await runAllTests(endpoint, debug);
  } else {
    // Run single test
    await testChatbot(endpoint, message, debug);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { testChatbot, runAllTests };

