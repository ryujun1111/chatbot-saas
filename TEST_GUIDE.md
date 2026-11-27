# ChatBot AI SaaS - Testing Guide

## Prerequisites

**OpenAI API Key Required:**
1. Go to https://platform.openai.com/api-keys
2. Create new secret key: "ChatBot-SaaS-Test"
3. Copy the key (starts with `sk-proj-...`)
4. Add to `.env.local`:
   ```
   OPENAI_API_KEY=sk-proj-YOUR_NEW_KEY_HERE
   ```
5. Restart dev server: `npm run dev`

---

## Test Sequence

### 1. API Key Verification (5 min)

**Terminal:**
```powershell
# Test OpenAI embedding
node -e "
const fetch = require('node:fetch');
const key = process.env.OPENAI_API_KEY;
fetch('https://api.openai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'text-embedding-3-small',
    input: 'Test'
  })
}).then(r => r.json()).then(d => {
  if (d.data) console.log('✅ OpenAI OK:', d.data[0].embedding.length, 'dimensions');
  else console.error('❌ OpenAI Error:', d);
});
"
```

Expected: `✅ OpenAI OK: 1536 dimensions`

---

### 2. Document Upload Test (10 min)

**Browser Console (http://localhost:3000/dashboard):**
```javascript
// Get auth token
const token = localStorage.getItem('supabase.auth.token');

// Upload document
fetch('http://localhost:3000/api/document/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    chatbotId: '924edfe1-2e85-4248-90ce-9117d8c12a98',
    content: 'ChatBot AI is an intelligent chatbot platform powered by DeepSeek R1. Our pricing starts at $19/month for the Starter plan with 1,000 messages. We help businesses automate customer support.',
    source: 'manual_test'
  })
}).then(r => r.json()).then(d => console.log('Document Upload:', d));
```

Expected:
```json
{
  "success": true,
  "document": {
    "id": "...",
    "chatbot_id": "924edfe1-2e85-4248-90ce-9117d8c12a98",
    "content": "ChatBot AI is...",
    "created_at": "..."
  }
}
```

---

### 3. URL Crawling Test (15 min)

**Browser Console:**
```javascript
// Crawl a simple page
fetch('http://localhost:3000/api/crawl', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    chatbotId: '924edfe1-2e85-4248-90ce-9117d8c12a98',
    url: 'https://example.com'
  })
}).then(r => r.json()).then(d => console.log('Crawl Result:', d));
```

Expected:
```json
{
  "success": true,
  "url": "https://example.com",
  "title": "Example Domain",
  "totalChunks": 1,
  "successfulChunks": 1,
  "failedChunks": 0,
  "documents": ["doc-id-1"]
}
```

---

### 4. AI Chat Test (10 min)

**Browser Console:**
```javascript
// Ask a question
fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    chatbotId: '924edfe1-2e85-4248-90ce-9117d8c12a98',
    message: 'What is your pricing?',
    sessionId: 'test_' + Date.now()
  })
}).then(r => r.json()).then(d => console.log('AI Response:', d));
```

Expected:
```json
{
  "answer": "Our pricing starts at $19/month for the Starter plan with 1,000 messages...",
  "usage": {
    "used": 1,
    "limit": 50
  }
}
```

---

### 5. Widget Test (20 min)

**Create test file: `test-widget.html`**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Widget Test</title>
</head>
<body>
  <h1>Test Page</h1>
  <p>Chatbot should appear in bottom right corner.</p>
  
  <script 
    src="http://localhost:3000/widget.js" 
    data-chatbot-id="924edfe1-2e85-4248-90ce-9117d8c12a98"
  ></script>
</body>
</html>
```

**Test Steps:**
1. Open `test-widget.html` in browser
2. Click chat button (bottom right)
3. Type: "What is your pricing?"
4. Verify AI response appears
5. Check network tab for `/api/chat` request

---

### 6. Full User Flow (30 min)

**Steps:**
1. ✅ Sign up new user (Email: test2@test.com)
2. ✅ Create chatbot (Name: "Test Bot 2")
3. ✅ Crawl URL: https://example.com
4. ✅ Verify documents in Supabase
5. ✅ Test AI chat with crawled data
6. ✅ Install widget on external page
7. ✅ Test widget without login

**Verification:**
- Supabase `documents` table has new rows
- AI answer includes information from crawled page
- Widget works for anonymous users

---

## Success Criteria

| Test | Pass Criteria |
|------|--------------|
| OpenAI Key | 200 response, 1536 dimensions |
| Document Upload | `success: true`, document ID returned |
| URL Crawling | `successfulChunks > 0` |
| AI Chat | Relevant answer with usage tracking |
| Widget | Chat opens, AI responds |
| Full Flow | End-to-end without errors |

---

## Common Issues

**401 Error:**
- Check `.env.local` has correct OpenAI key
- Restart server after adding key

**403 Error:**
- Check Supabase auth token
- Verify chatbot ownership

**Empty AI Response:**
- Check documents exist in database
- Verify embedding generation succeeded

**Widget Not Loading:**
- Check CORS settings
- Verify widget.js is accessible
- Check browser console for errors

---

## Cost Tracking

**OpenAI API Costs (text-embedding-3-small):**
- Price: $0.02 per 1M tokens
- 1,000 tokens: $0.00002
- 100,000 tokens: $0.002
- 1,000,000 tokens: $0.02

**Expected Test Costs:**
- Document upload (100 tests): ~$0.001
- Crawling (10 pages): ~$0.002
- AI chat (100 questions): ~$0.005
- **Total test cost: <$0.01**

---

## Next Steps After Tests Pass

1. ✅ Update Vercel environment variables
2. ✅ Test production deployment
3. ✅ Set up Paddle webhook endpoint
4. ✅ Test Sandbox payment
5. ✅ Prepare marketing materials
6. ✅ Launch to first customer

---

**Ready to test!** Add OpenAI API key to `.env.local` and run tests in order.
