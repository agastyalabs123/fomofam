# Auth Testing Playbook for FomoFam

## Step 1: Create Test User & Session

```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  auth_provider: 'jwt',
  role: 'attendee',
  reputation_score: 0,
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend API

```bash
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)

# Test auth endpoint
curl -X GET "$API_URL/api/auth/me" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Test events
curl -X GET "$API_URL/api/events"

# Test communities  
curl -X GET "$API_URL/api/communities"

# Test waitlist
curl -X POST "$API_URL/api/waitlist" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Step 3: Browser Testing

```python
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "your-app.com",
    "path": "/",
    "httpOnly": True,
    "secure": True,
    "sameSite": "None"
}])
await page.goto("https://your-app.com")
```

## Checklist
- [ ] User document has user_id field
- [ ] Session user_id matches user's user_id exactly
- [ ] /api/auth/me returns user data
- [ ] /api/events returns seeded events
- [ ] /api/communities returns seeded communities
- [ ] Register flow works (POST /api/auth/register)
- [ ] Login flow works (POST /api/auth/login)
- [ ] Google OAuth callback works
- [ ] Waitlist signup works
- [ ] Navbar shows user name after login
- [ ] Logout clears session
