const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;

export const chatSession = async (userMessage) => {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro', 
        messages: [
          {
            role: 'system',
            content: 'You are a helpful travel planning assistant. Generate detailed travel plans in JSON format with hotels and itinerary information.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 4096,
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Perplexity API error response:', errorData);
      throw new Error(`Perplexity API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Perplexity API:', error);
    throw error;
  }
};
