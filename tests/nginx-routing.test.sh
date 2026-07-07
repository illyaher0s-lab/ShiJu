#!/bin/bash
set -e

BASE_URL="http://43.128.11.119/shiju"

echo "Testing nginx routing..."

# Test 1: JS file should return JavaScript, not HTML
echo "[TEST 1] JS file returns correct Content-Type"
CONTENT_TYPE=$(curl -sI "$BASE_URL/assets/index-CnwKkKOu.js" | grep -i "content-type" | tr -d '\r')
if [[ $CONTENT_TYPE == *"application/javascript"* ]] || [[ $CONTENT_TYPE == *"text/javascript"* ]]; then
    echo "✓ PASS: JS file returns JavaScript"
else
    echo "✗ FAIL: JS file returns $CONTENT_TYPE (expected JavaScript)"
    exit 1
fi

# Test 2: JS file should NOT return 301 redirect
echo "[TEST 2] JS file returns 200, not 301"
HTTP_STATUS=$(curl -sI "$BASE_URL/assets/index-CnwKkKOu.js" | head -1 | awk '{print $2}')
if [[ $HTTP_STATUS == "200" ]]; then
    echo "✓ PASS: JS file returns 200"
else
    echo "✗ FAIL: JS file returns $HTTP_STATUS (expected 200)"
    exit 1
fi

# Test 3: CSS file should return CSS
echo "[TEST 3] CSS file returns correct Content-Type"
CONTENT_TYPE=$(curl -sI "$BASE_URL/assets/index-C8yu4Pc9.css" | grep -i "content-type" | tr -d '\r')
if [[ $CONTENT_TYPE == *"text/css"* ]]; then
    echo "✓ PASS: CSS file returns CSS"
else
    echo "✗ FAIL: CSS file returns $CONTENT_TYPE (expected CSS)"
    exit 1
fi

# Test 4: HTML route should return index.html
echo "[TEST 4] HTML route returns index.html"
CONTENT=$(curl -s "$BASE_URL/articles/test-id" | head -5)
if [[ $CONTENT == *"<!doctype html>"* ]]; then
    echo "✓ PASS: HTML route returns index.html"
else
    echo "✗ FAIL: HTML route does not return HTML"
    exit 1
fi

# Test 5: API endpoint should proxy to backend
echo "[TEST 5] API endpoint proxies correctly"
API_RESPONSE=$(curl -s "$BASE_URL/api/health")
if [[ $API_RESPONSE == *"\"status\":\"ok\""* ]]; then
    echo "✓ PASS: API endpoint works"
else
    echo "✗ FAIL: API endpoint does not return expected JSON"
    exit 1
fi

echo ""
echo "All tests passed ✓"
