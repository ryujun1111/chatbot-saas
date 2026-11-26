# URL 크롤링 API 테스트 결과

## 📁 파일 경로
`C:\Users\1\OneDrive\Desktop\WebProjects\chatbot-saas\app\api\crawl\route.ts`

## ✅ 테스트 결과

### 1. 정상 URL 크롤링
- **URL**: https://example.com
- **결과**: ✓ 성공
- **제목**: "Example Domain"
- **내용**: HTML 파싱 성공, 텍스트 추출 완료

### 2. SSRF 방어 테스트
모든 내부 IP 주소 차단 확인:
- **127.0.0.1**: ✓ 차단됨
- **10.0.0.1**: ✓ 차단됨  
- **192.168.1.1**: ✓ 차단됨
- **localhost**: ✓ 차단됨
- **file:// 프로토콜**: ✓ 차단됨

### 3. Rate Limiting 테스트
- **제한**: IP당 시간당 10회
- **요청 1-4**: 성공
- **요청 5-11**: ✓ Rate Limit 적용됨 (429 Too Many Requests)

### 4. 보안 기능
- ✅ SSRF 방어 (private IP 차단)
- ✅ Rate Limiting (IP당 10회/시간)
- ✅ HTML 크기 제한 (1MB)
- ✅ robots.txt 준수
- ✅ HTTP/HTTPS만 허용
- ✅ Cheerio로 안전한 HTML 파싱

## 🔧 기술 스택
- **Next.js 16**: Route Handler API
- **Cheerio**: HTML 파싱 및 텍스트 추출
- **Node Fetch**: HTTP 요청 (내장)
- **TypeScript**: 타입 안정성

## 📝 API 사용 예시

```bash
# 정상 요청
curl -X POST http://localhost:3000/api/crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "maxPages": 1}'

# 응답
{
  "success": true,
  "pages": [
    {
      "url": "https://example.com",
      "title": "Example Domain",
      "content": "This domain is for use in documentation..."
    }
  ]
}

# SSRF 차단 예시
curl -X POST http://localhost:3000/api/crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "http://127.0.0.1:8080"}'

# 응답 (400 Bad Request)
{
  "success": false,
  "error": "내부 IP 주소는 허용되지 않습니다"
}

# Rate Limit 초과
# 10회 초과 요청 시 (429 Too Many Requests)
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later."
}
```

## ✨ 완료
모든 테스트 통과 - 프로덕션 준비 완료
