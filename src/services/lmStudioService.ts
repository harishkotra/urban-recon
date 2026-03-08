export interface AgentGuess {
  lat: number;
  lng: number;
  reasoning: string;
}

export const solveLocation = async (
  imageUrl: string,
  baseUrl: string = "http://localhost:1234/v1",
  model: string = "qwen2.5vl:7b"
): Promise<AgentGuess> => {
  const prompt = `You are a world-class GeoGuesser expert. 
Analyze the provided image and determine its geographic location.
Look for:
- Architecture styles
- Flora and fauna
- Road signs and markings
- Language on signs
- Sun position/shadows
- License plates

Return your answer ONLY as a JSON object with the following structure:
{
  "lat": number,
  "lng": number,
  "reasoning": "A brief explanation of why you think it's here based on visual cues"
}
Do not include any other text in your response.`;

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`LM Studio API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Attempt to parse JSON from the response
    // Sometimes models wrap JSON in markdown blocks
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error("Could not parse agent response as JSON");
  } catch (error) {
    console.error("Agent Error:", error);
    throw error;
  }
};
