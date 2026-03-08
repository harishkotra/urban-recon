export interface AgentGuess {
  lat: number;
  lng: number;
  reasoning: string;
}

// Helper to convert image URL to base64 in browser
const getBase64Image = async (url: string): Promise<string> => {
  // If it's already a base64 data URL, just return it
  if (url.startsWith('data:image/')) {
    return url;
  }

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error fetching image for base64 conversion:", error);
    throw new Error("Failed to load image for agent analysis.");
  }
};

export const solveLocation = async (
  imageSource: string,
  hints: string[],
  baseUrl: string = "/v1",
  model: string = "qwen/qwen3-vl-8b"
): Promise<AgentGuess> => {
  const prompt = `You are a world-class Urban Planning & Intelligence Expert.
Analyze the provided anonymized city map blueprint and determine which famous world city this is.

MISSION CLUES (Metadata extracted from the region):
${hints.map(h => `- ${h}`).join('\n')}

Look for unique urban planning signatures combined with the clues above:
- Street grid regularity or organic complexity
- Specific radial or geometric patterns (e.g., Star-shaped, Airplane-shaped, Octagonal)
- Major arteries, ring roads, or water bodies/canals
- Zoning density and block structures

Return your answer ONLY as a JSON object with the following structure:
{
  "lat": number,
  "lng": number,
  "reasoning": "A brief explanation identifying the urban planning patterns and how they correlate with the MISSION CLUES."
}
Do not include any other text in your response.`;

  try {
    // LLMs running locally often cannot fetch external URLs.
    // Convert to base64 first.
    console.log("Analyzing map blueprint...");
    const base64Image = await getBase64Image(imageSource);
    console.log("Blueprint encoded, sending to Agent...");

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
                  url: base64Image,
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
  } catch (error: any) {
    console.error("Agent Error:", error);
    if (error.message === "Failed to fetch") {
      throw new Error("LMStudio Connection Refused - Is it running on " + baseUrl + "?");
    }
    throw error;
  }
};
