// Minimal self-check for security-critical helpers. Run: node scripts/selfcheck.mjs  (Node 23.6+ strips TS types)
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

process.env.OPENAI_API_KEY ||= 'sk-test-dummy';
const { verifyPaddleSignature } = await import('../lib/paddle.ts');
const { assertPublicUrl } = await import('../lib/crawler.ts');
const { splitTextIntoChunks } = await import('../lib/ai-client.ts');

// Paddle webhook signature
const secret = 'pdl_ntfset_test_secret';
const body = '{"event_id":"evt_1"}';
const ts = Math.floor(Date.now() / 1000);
const h1 = crypto.createHmac('sha256', secret).update(`${ts}:${body}`).digest('hex');
assert.equal(verifyPaddleSignature(body, `ts=${ts};h1=${h1}`, secret), true, 'valid signature');
assert.equal(verifyPaddleSignature(body + ' ', `ts=${ts};h1=${h1}`, secret), false, 'tampered body');
assert.equal(verifyPaddleSignature(body, `ts=${ts};h1=${h1}`, 'wrong'), false, 'wrong secret');
assert.equal(verifyPaddleSignature(body, `ts=${ts - 600};h1=${h1}`, secret), false, 'replayed (old ts)');
assert.equal(verifyPaddleSignature(body, `ts=${ts};h1=abc`, secret), false, 'short signature');
assert.equal(verifyPaddleSignature(body, null, secret), false, 'missing header');
assert.equal(verifyPaddleSignature(body, `ts=${ts};h1=bad;h1=${h1}`, secret), true, 'rotated secrets (2nd h1)');

// SSRF guard
for (const bad of ['http://localhost/', 'http://127.0.0.1/', 'http://10.1.2.3/', 'http://169.254.169.254/latest',
  'http://192.168.0.1', 'http://[::1]/', 'file:///etc/passwd', 'ftp://example.com', 'not a url', 'http://0.0.0.0']) {
  await assert.rejects(assertPublicUrl(bad), `should reject ${bad}`);
}
assert.equal((await assertPublicUrl('https://example.com/a#frag')).toString(), 'https://example.com/a');

// Chunker: covers all text, respects size, overlaps
const text = Array.from({ length: 400 }, (_, i) => `Sentence number ${i} about the product.`).join(' ');
const chunks = splitTextIntoChunks(text, 1000, 150);
assert.ok(chunks.length > 1 && chunks.every((c) => c.length <= 1000), 'chunk sizes');
assert.ok(chunks.at(-1).endsWith('Sentence number 399 about the product.'), 'last sentence kept');
assert.deepEqual(splitTextIntoChunks('   '), [], 'empty input');

console.log('selfcheck: all passed');
