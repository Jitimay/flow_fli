#!/bin/bash

# Simple test script for the FlowFli Backend API

BASE_URL="http://localhost:3000/api"

echo "--- FlowFli API Test Suite ---"

# Test 1: Get sensor readings
echo -e "\\n[TEST 1] Reading from sensor simulator..."
curl -s -X GET "$BASE_URL/sensor/read" | sed 's/{"/{\\n  "/g;s/,"/",\\n  "/g;s/}/\n}/g' # Pretty print JSON
echo -e "\\n"


# Test 2: Process a valid payment
echo "[TEST 2] Processing a valid payment of \$1.50..."
curl -s -X POST "$BASE_URL/payment/process" \\
     -H "Content-Type: application/json" \\
     -d '{"amount": 1.50, "source": "test-script-user"}'
echo -e "\\n"


# Test 3: Process a fraudulent payment (amount too low)
echo "[TEST 3] Processing a fraudulent payment of \$0.10..."
curl -s -X POST "$BASE_URL/payment/process" \\
     -H "Content-Type: application/json" \\
     -d '{"amount": 0.10, "source": "test-script-fraud"}'
echo -e "\\n"


# Test 4: Manually activate pump (This is usually done by the agent after payment)
echo "[TEST 4] Manually activating pump for 5 seconds..."
curl -s -X POST "$BASE_URL/pump/activate" \\
     -H "Content-Type: application/json" \\
     -d '{"duration": 5}'
echo -e "\\n"

# Wait for pump to finish
sleep 6

# Test 5: Get system logs
echo "[TEST 5] Getting system logs..."
curl -s -X GET "$BASE_URL/logs" | sed 's/\[{/\[\\n  {/g;s/},{/},\\n  {/g;s/}]/\\n]/g' # Pretty print JSON
echo -e "\\n"

echo "--- Test Suite Finished ---"
