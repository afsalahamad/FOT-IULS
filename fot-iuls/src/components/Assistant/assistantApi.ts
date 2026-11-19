export async function sendChatMessage(
  message: string,
  history: { role: 'user' | 'assistant'; text: string }[]
): Promise<string> {
  const payload = {
    message,
    history: history.slice(-6).map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      text: h.text,
    })),
  };

  const endpoints = [
    '/api/assistant/chat',
    'http://localhost:8001/api/assistant/chat',
    'http://localhost:8000/api/assistant/chat',
  ];

  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        return data.reply || 'No response generated.';
      }
    } catch (err) {
      lastError = err as Error;
    }
  }

  console.error('[Scholar AI] Network error reaching assistant backend:', lastError);
  throw new Error('Could not connect to the IULS AI service. Please ensure the backend server is running.');
}
