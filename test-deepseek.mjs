import OpenAI from 'openai';

const testDeepSeek = async () => {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });

    console.log('Testing DeepSeek R1 model...\n');
    
    const response = await client.chat.completions.create({
      model: 'deepseek/deepseek-r1',
      messages: [
        { role: 'user', content: 'Say "DeepSeek R1 is working" if you can read this.' }
      ],
      max_tokens: 50,
    });

    const answer = response.choices[0]?.message?.content || '';
    
    console.log('✅ DeepSeek R1 Test PASS');
    console.log('Model:', response.model);
    console.log('Answer:', answer);
    console.log('Usage:', JSON.stringify(response.usage, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ DeepSeek R1 Test FAIL');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
};

testDeepSeek();
