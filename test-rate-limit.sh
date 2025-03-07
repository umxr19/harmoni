# Get auth token (replace with your actual login credentials)
echo "Getting auth token..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.token')

echo "Token received: ${TOKEN:0:20}..."

# Function to make tutor request
make_request() {
  curl -s -X POST http://localhost:3000/api/openai/tutor \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"question":"What is 2+2?","context":"math"}' \
    | jq '.'
}

# Make 4 requests (should hit rate limit on 4th)
echo "\nMaking request 1..."
make_request
sleep 1

echo "\nMaking request 2..."
make_request
sleep 1

echo "\nMaking request 3..."
make_request
sleep 1

echo "\nMaking request 4 (should be rate limited)..."
make_request 