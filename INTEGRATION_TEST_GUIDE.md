# Integration Test Guide

**Created:** 2026-11-28 00:28:29  
**Commit:** 8bfd08d2e23370476bbd6e2c362c6b2e0cd86ebb  
**Purpose:** Execute actual tests, not just code reviews

---

## Setup Checklist

### 1. Create Test Supabase Project

**Link:** https://supabase.com/dashboard

**Steps:**
1. Click "New project"
2. Name: `chatbot-saas-test`
3. Database password: (save this)
4. Region: Choose closest to you
5. Click "Create new project"

**Get API Keys:**
1. Go to Project Settings → API
2. Copy `URL` → Save as `NEXT_PUBLIC_SUPABASE_URL`
3. Copy `anon public` → Save as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy `service_role` (secret) → Save as `SUPABASE_SERVICE_ROLE_KEY`

---

### 2. Execute Database Migration

**Link:** https://supabase.com/dashboard (your test project) → SQL Editor

**Steps:**
1. Open SQL Editor
2. Click "New query"
3. Copy ALL content from `supabase/migrations/002_security_fixed.sql`
4. Paste into SQL Editor
5. Click "Run"
6. Check for errors

**Verify:**
```sql
-- Check if functions were created
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('check_and_increment_usage', 'reset_monthly_usage');

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('webhook_events', 'rate_limits');

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

**Expected Results:**
- 2 functions created
- 2 new tables (webhook_events, rate_limits)
- Multiple RLS policies on users, chatbots, documents

---

### 3. Set Environment Variables

**Vercel Link:** https://vercel.com/ryujun1111/chatbot-saas → Settings → Environment Variables

**Required Variables:**

| Variable | Where to Get | Notes |
|----------|--------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings → API | Public, starts with https:// |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Project Settings → API | Public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings → API | **Secret**, do NOT expose |
| `PADDLE_API_KEY` | Paddle Dashboard → Developer Tools → Authentication | **Secret** |
| `PADDLE_WEBHOOK_SECRET` | Paddle Dashboard → Developer Tools → Notifications | **Secret** |
| `OPENROUTER_API_KEY` | https://openrouter.ai/keys | **Secret** |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Paddle Dashboard → Developer Tools → Authentication | Public, starts with live_ |

**Steps:**
1. Go to Vercel project settings
2. Click "Environment Variables"
3. Add each variable
4. Select "Production", "Preview", "Development"
5. Click "Save"
6. Redeploy after adding all variables

---

### 4. Verify DeepSeek R1 Model

**OpenRouter Link:** https://openrouter.ai/models

**Steps:**
1. Go to OpenRouter Models page
2. Search for "deepseek"
3. Check if `deepseek/deepseek-r1` exists
4. If not, find available model (e.g., `deepseek/deepseek-chat`)

**Local Test:**
```bash
# Set API key first
$env:OPENROUTER_API_KEY = "your-key-here"

# Run test
node test-deepseek.mjs
```

**Expected Output:**
```
Testing DeepSeek R1 model...

✅ DeepSeek R1 Test PASS
Model: deepseek/deepseek-r1
Answer: DeepSeek R1 is working
Usage: { ... }
```

**If Failed:**
- Check API key is valid
- Check model name is correct
- Try alternative model: `deepseek/deepseek-chat`

---

### 5. Register Paddle Webhook

**Paddle Link:** https://vendors.paddle.com/settings/notifications

**Steps:**
1. Click "Add Notification"
2. URL: `https://chatbot-saas-tau-sandy.vercel.app/api/webhooks/paddle`
3. Enable these events:
   - ✅ transaction.completed
   - ✅ subscription.canceled
   - ✅ subscription.updated
   - ✅ transaction.payment_failed
4. Click "Save"

**Test Webhook:**
1. Click "Send Test" in Paddle Dashboard
2. Check Vercel logs: https://vercel.com/ryujun1111/chatbot-saas → Logs
3. Should see: `Paddle Webhook received: transaction.completed`

---

## Integration Tests

### Test 1: AI Answer Generation

**Steps:**
1. Create a test chatbot in dashboard
2. Upload a test document (PDF/URL)
3. Send POST to `/api/chat`:
   ```json
   {
     "chatbotId": "your-chatbot-id",
     "message": "What is this document about?",
     "sessionId": "test-session-123"
   }
   ```
4. Check response

**Expected:**
- Status: 200
- Response contains `answer`, `sources`, `usage`
- Usage incremented in database

**How to Test:**
```powershell
$body = @{
  chatbotId = "your-id"
  message = "test question"
  sessionId = "test-123"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://chatbot-saas-tau-sandy.vercel.app/api/chat" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

---

### Test 2: Anonymous Chatbot Access

**Steps:**
1. Use chatbot without authentication
2. No userId in request (only sessionId)
3. Owner's quota should be used

**Test:**
```powershell
$body = @{
  chatbotId = "your-id"
  message = "test from anonymous"
  sessionId = "anon-123"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://chatbot-saas-tau-sandy.vercel.app/api/chat" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

**Verify:**
- Request succeeds
- Owner's `messages_used` increments (not client's)

---

### Test 3: Rate Limiting

**Steps:**
1. Send 21 requests with same sessionId
2. 21st request should fail

**Test:**
```powershell
1..21 | ForEach-Object {
  $body = @{
    chatbotId = "your-id"
    message = "test $_"
    sessionId = "rate-test"
  } | ConvertTo-Json
  
  $response = Invoke-RestMethod `
    -Uri "https://chatbot-saas-tau-sandy.vercel.app/api/chat" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -ErrorAction SilentlyContinue
  
  Write-Host "Request $_: $($response.answer ? 'OK' : 'BLOCKED')"
}
```

**Expected:**
- Requests 1-20: Success
- Request 21: Error 429

---

### Test 4: Usage Quota Enforcement

**Steps:**
1. Set test user's `message_limit` to 2
2. Send 3 chat requests
3. 3rd should fail with quota error

**Setup:**
```sql
-- In Supabase SQL Editor
UPDATE users 
SET message_limit = 2, messages_used = 0 
WHERE id = 'your-user-id';
```

**Test:**
```powershell
1..3 | ForEach-Object {
  # Send request
  Write-Host "Request $_"
}
```

**Expected:**
- Requests 1-2: Success
- Request 3: Error 429 "Monthly message limit reached"

---

### Test 5: Paddle Sandbox Payment

**Paddle Link:** https://sandbox-vendors.paddle.com

**Steps:**
1. Switch Paddle to Sandbox mode
2. Create test payment link
3. Use Paddle test card:
   - Card: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits
4. Complete payment
5. Check webhook received
6. Check user upgraded in database

**Verify:**
```sql
-- Check user plan after payment
SELECT id, email, plan, message_limit, subscription_status 
FROM users 
WHERE paddle_customer_id = 'ctm_test_xxx';

-- Check webhook event recorded
SELECT event_id, event_type, processed_at 
FROM webhook_events 
ORDER BY created_at DESC 
LIMIT 5;
```

**Expected:**
- User plan upgraded (free → starter)
- message_limit changed (50 → 1000)
- messages_used reset to 0
- subscription_status = 'active'
- Webhook event recorded

---

### Test 6: Subscription Cancel

**Steps:**
1. Cancel subscription in Paddle Sandbox
2. Wait for webhook
3. Check user downgraded to free

**Verify:**
```sql
SELECT plan, message_limit, subscription_status 
FROM users 
WHERE paddle_customer_id = 'ctm_test_xxx';
```

**Expected:**
- plan = 'free'
- message_limit = 50
- subscription_status = 'active' (still usable)

---

### Test 7: Atomic Usage Counter

**Steps:**
1. Send 10 concurrent requests
2. Check final usage count

**Test:**
```powershell
$jobs = 1..10 | ForEach-Object {
  Start-Job -ScriptBlock {
    param($i)
    $body = @{
      chatbotId = $using:chatbotId
      message = "concurrent test $i"
      sessionId = "concurrent-$i"
    } | ConvertTo-Json
    
    Invoke-RestMethod `
      -Uri "https://chatbot-saas-tau-sandy.vercel.app/api/chat" `
      -Method POST `
      -Body $body `
      -ContentType "application/json"
  } -ArgumentList $_
}

$jobs | Wait-Job | Receive-Job
```

**Verify:**
```sql
SELECT messages_used FROM users WHERE id = 'your-user-id';
```

**Expected:**
- messages_used = 10 (not duplicated, not lost)

---

## Test Results Template

```markdown
## Test Results - [Date]

| Test | Status | Notes |
|------|--------|-------|
| Supabase Migration | ⚠️ NOT RUN | |
| AI Answer Generation | ⚠️ NOT RUN | |
| Anonymous Access | ⚠️ NOT RUN | |
| Rate Limiting | ⚠️ NOT RUN | |
| Usage Quota | ⚠️ NOT RUN | |
| Paddle Payment | ⚠️ NOT RUN | |
| Subscription Cancel | ⚠️ NOT RUN | |
| Atomic Counter | ⚠️ NOT RUN | |

**Logs:**
(Attach actual logs here)

**Screenshots:**
(If applicable)

**Blockers:**
(If any)
```

---

## Troubleshooting

### SQL Migration Fails

**Error:** "relation already exists"
- **Fix:** Drop old tables first or use `CREATE TABLE IF NOT EXISTS`

**Error:** "function already exists"
- **Fix:** Use `CREATE OR REPLACE FUNCTION`

### Environment Variables Not Working

**Check:**
1. Variable names are exact (case-sensitive)
2. Vercel redeploy after adding variables
3. Clear browser cache

### DeepSeek Model Not Found

**Check:**
1. API key is valid
2. Model name is correct
3. Try alternative: `deepseek/deepseek-chat`

### Paddle Webhook Not Received

**Check:**
1. Webhook URL is correct
2. Events are enabled
3. Vercel deployment is live
4. Check Vercel logs for errors

---

## Next Steps After Tests Pass

1. Create production Supabase project
2. Run migration on production
3. Update Vercel environment variables to production
4. Switch Paddle from Sandbox to Live
5. Test with real payment ($1 test)
6. Launch to public

---

**Important:** Do NOT use production database for testing. Always test on separate Supabase project first.
