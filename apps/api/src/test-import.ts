import 'dotenv/config';

const API_URL = 'http://localhost:3001';

async function testImport() {
  console.log('[TEST] Starting import test...');
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_URL}/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Import Test Article',
        rawText: 'This is a test article with enough content to trigger AI generation. The momentum did not arrive all at once. Teachers noticed students becoming more engaged over time. This gradual shift was important for long-term change in the education system.',
        sourceType: 'txt'
      })
    });
    
    const elapsed = Date.now() - startTime;
    console.log(`[TEST] Response received in ${elapsed}ms`);
    console.log(`[TEST] Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`[TEST] Success! Article ID: ${data.article.id}`);
      console.log(`[TEST] Candidates: ${data.candidates?.length || 0}`);
    } else {
      const error = await response.text();
      console.log(`[TEST] Error: ${error}`);
    }
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.log(`[TEST] Failed after ${elapsed}ms: ${error}`);
  }
}

testImport().then(() => process.exit(0));
