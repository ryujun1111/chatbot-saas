/**
 * 임베딩 API 테스트 스크립트
 * 사용법: node test-embed.mjs
 */

const API_URL = 'http://localhost:3000/api/embed';

async function testEmbedAPI() {
  console.log('=== OpenAI 임베딩 API 테스트 ===\n');

  // 테스트 데이터
  const testData = {
    text: '안녕하세요. 이것은 임베딩 API 테스트입니다. 텍스트를 벡터로 변환하는 기능을 테스트합니다.',
    chatbotId: 'test-chatbot-001'
  };

  try {
    console.log('1. API 정보 확인 (GET)...');
    const infoResponse = await fetch(API_URL);
    const info = await infoResponse.json();
    console.log('✅ API 정보:', JSON.stringify(info, null, 2));
    console.log('');

    console.log('2. 임베딩 생성 테스트 (POST)...');
    console.log('테스트 데이터:', testData);
    console.log('');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ API 오류:', result);
      return;
    }

    console.log('✅ 응답 성공!');
    console.log('- success:', result.success);
    console.log('- 임베딩 차원:', result.embedding?.length);
    console.log('- 청크 개수:', result.chunks?.length);
    console.log('- 메타데이터:', result.metadata);
    console.log('');

    // 임베딩 벡터 샘플 출력
    if (result.embedding && result.embedding.length > 0) {
      console.log('임베딩 벡터 샘플 (처음 10개):');
      console.log(result.embedding.slice(0, 10));
      console.log('...');
      console.log('');
    }

    // 청크 출력
    if (result.chunks && result.chunks.length > 0) {
      console.log('생성된 청크:');
      result.chunks.forEach((chunk, idx) => {
        console.log(`  [${idx + 1}] ${chunk.substring(0, 50)}...`);
      });
      console.log('');
    }

    // 검증
    console.log('3. 검증 결과:');
    const checks = [
      { name: '임베딩 차원 1536', pass: result.embedding?.length === 1536 },
      { name: '청크 생성', pass: result.chunks?.length > 0 },
      { name: 'chatbotId 일치', pass: result.metadata?.chatbotId === testData.chatbotId },
      { name: '모델 확인', pass: result.metadata?.model === 'text-embedding-3-small' },
    ];

    checks.forEach(check => {
      console.log(`${check.pass ? '✅' : '❌'} ${check.name}`);
    });

    console.log('');
    console.log('=== 테스트 완료 ===');

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    console.log('');
    console.log('참고: 개발 서버가 실행 중인지 확인하세요 (npm run dev)');
  }
}

// 긴 텍스트 테스트 (여러 청크)
async function testLongText() {
  console.log('\n=== 긴 텍스트 테스트 (여러 청크) ===\n');

  const longText = `
    챗봇 SaaS는 기업과 개인이 쉽게 AI 챗봇을 구축하고 웹사이트에 통합할 수 있도록 돕는 서비스입니다.
    사용자는 별도의 코딩 없이 직관적인 인터페이스를 통해 챗봇을 생성하고 관리할 수 있습니다.
    
    주요 기능으로는 다음과 같습니다:
    1. 문서 업로드: PDF, 텍스트 파일 등을 업로드하여 챗봇 학습 데이터로 활용
    2. 웹 크롤링: 웹사이트 URL을 입력하면 자동으로 콘텐츠를 수집하여 학습
    3. 맞춤형 디자인: 챗봇의 색상, 로고, 메시지 등을 커스터마이징 가능
    4. 임베딩 기술: OpenAI의 최신 임베딩 모델을 사용하여 의미론적 검색 구현
    5. 실시간 응답: 사용자 질문에 대해 관련성 높은 답변을 즉시 제공
    
    이 서비스는 고객 지원, 제품 안내, FAQ 자동화 등 다양한 비즈니스 시나리오에 활용될 수 있습니다.
  `.trim();

  const testData = {
    text: longText,
    chatbotId: 'test-chatbot-002'
  };

  try {
    console.log('긴 텍스트 길이:', longText.length, '자');
    console.log('');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ 성공!');
      console.log('- 청크 개수:', result.chunks.length);
      console.log('- 총 임베딩 개수:', result.metadata.totalChunks);
      console.log('');
      
      result.chunks.forEach((chunk, idx) => {
        console.log(`청크 ${idx + 1} (${chunk.length}자):`);
        console.log(chunk.substring(0, 100) + '...\n');
      });
    } else {
      console.error('❌ 실패:', result.error);
    }

  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

// 메인 실행
(async () => {
  await testEmbedAPI();
  await testLongText();
})();
