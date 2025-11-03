import { NextRequest, NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || "",
});

// Helper function to try translation with retry
async function tryTranslateWithRetry(text: string, userPrompt: string, delay = 0, retries = 2): Promise<string> {
  const model = "mistral-medium-2508";

  // If delay is set, wait before retrying
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
        console.log(`⏳ Retry attempt ${attempt}/${retries} after ${waitTime}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      console.log(`🔮 Attempt ${attempt + 1}/${retries + 1} with model: ${model}`);
      const completion = await mistral.chat.complete({
        model: model,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 1.5,
        maxTokens: 120,
      });

      // Handle content that can be string or ContentChunk[]
      const content = completion.choices[0]?.message?.content;
      let translation: string = "";
      
      if (typeof content === "string") {
        translation = content.trim();
      } else if (Array.isArray(content)) {
        // If it's an array, join all text chunks (filter out image chunks)
        translation = content
          .map(chunk => {
            if (typeof chunk === "string") {
              return chunk;
            }
            // Check if it's a text chunk (has 'text' property)
            if ("text" in chunk && typeof chunk.text === "string") {
              return chunk.text;
            }
            // Skip image chunks or other types
            return "";
          })
          .join("")
          .trim();
      }
      
      // Sanity checks for valid translation
      if (!translation || translation.length < 10) {
        throw new Error("Translation too short or empty");
      }
      
      // Check for garbage output - if it contains too many non-ASCII characters or looks like random text
      const asciiRatio = (translation.match(/[a-zA-Z0-9\s.,!?'":;@#$%^&*()\-_+=]/g) || []).length / translation.length;
      const hasTooManySpecialChars = (translation.match(/[^\x00-\x7F]/g) || []).length > translation.length * 0.3;
      
      if (asciiRatio < 0.5 || hasTooManySpecialChars) {
        console.log(`⚠️ Translation looks garbled (ASCII ratio: ${asciiRatio.toFixed(2)}), retrying...`);
        if (attempt < retries) {
          continue; // Retry
        } else {
          throw new Error("Translation appears to be garbled/invalid");
        }
      }
      
      console.log(`✅ Success with model: ${model}`);
      return translation;
    } catch (modelError: any) {
      console.log(`❌ Attempt ${attempt + 1} failed:`, modelError?.message?.substring(0, 100));
      
      // If it's a capacity error and we have retries left, continue
      if (modelError?.statusCode === 429) {
        const errorBody = typeof modelError.body === 'string' ? JSON.parse(modelError.body) : modelError.body || {};
        if (errorBody.code === "3505" || errorBody.type === "service_tier_capacity_exceeded") {
          if (attempt < retries) {
            console.log(`⚠️ Model at capacity, will retry...`);
            continue; // Try again with delay
          }
        }
      }
      
      // If it's the last attempt, throw the error
      if (attempt === retries) {
        throw modelError;
      }
    }
  }

  throw new Error("All retry attempts failed");
}

export async function POST(request: NextRequest) {
  console.log("=== TRANSLATE API ROUTE CALLED ===");
  
  // Parse request once and store for use in catch block
  let text: string = "";
  let userPrompt: string = "";
  
  try {
    const body = await request.json();
    text = body.text;
    console.log("Received text to translate:", text?.substring(0, 50));

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (!process.env.MISTRAL_API_KEY) {
      console.error("❌ MISTRAL_API_KEY not found in environment");
      return NextResponse.json(
        { error: "Mistral API key is not configured" },
        { status: 500 }
      );
    }
    console.log("✅ Mistral API key found");
    
    // Simplified prompt structure - matching direct Mistral calls more closely
    userPrompt = `Translate what this person REALLY means in the most brutal, chaotic, horny TikTok roast way possible. Assume they're lying, thirsty, or about to make the absolute worst decision. Hyper-specific, messy scenarios only: DMs blowing up at 3AM, hookups gone sideways, blackout nights, last-minute regrets, clout-chasing disasters, cringe group chat moments, or impulsive bad decisions. Use Gen Z slang (no cap, sigma, gyatt, based, vibe check, etc.) and sprinkle these emojis only when it hits: 💀 🥀 😭.

No mercy: if they say "I'm loyal," they're cheating; if "I'm single," they're lying; if "I'm happy," meltdown incoming. Make it SHORT (keep it to 1-2 sentences, under 20 words), vicious, horny, and chaotic AF. Bonus points for hyper-specific, messy, and painfully relatable moments.

CRITICAL FORMATTING RULES:
- Output ONLY the translation text
- NO prefixes like "Translation:" or "Result:"
- NO hashtags (#)
- NO markdown formatting (**bold**, etc.)
- NO quotes around the output
- NO extra explanations
- Just the raw translation text, casual TikTok tone

Example format: "bout to dm their ex drunk while ghosting their new fling 💀"

Now translate this (output ONLY the translation, nothing else): "${text}"`;
    
    console.log("📤 Making API call to Mistral with retry logic...");
    
    // Try translation with retry logic
    let translation = await tryTranslateWithRetry(text, userPrompt);
    
    console.log("💬 Raw translation received:", translation);
    console.log("=== TRANSLATE API ROUTE COMPLETE ===");

    // Clean up the translation: remove prefixes, markdown, hashtags, extra formatting
    translation = translation
      .replace(/^(Translation:|Result:|Output:)\s*/i, '') // Remove prefixes
      .replace(/^\*\*|\*\*$/g, '') // Remove markdown bold
      .replace(/#\w+/g, '') // Remove hashtags
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markdown
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/^Translation:\s*/i, '') // Remove "Translation:" if it appears
      .trim();

    // If it's too long, truncate to first 2 sentences max
    const sentences = translation.split(/[.!?]+\s/);
    if (sentences.length > 2) {
      translation = sentences.slice(0, 2).join('. ') + '.';
    }
    
    // Additional truncation if still too long (more than 140 characters)
    if (translation.length > 140) {
      const words = translation.split(' ');
      translation = words.slice(0, 25).join(' ') + '...';
    }

    return NextResponse.json({ translation });
  } catch (error: any) {
    console.error("❌ MISTRAL API ERROR:", error);
    console.error("Error details:", {
      message: error?.message,
      status: error?.statusCode || error?.status,
      code: error?.code,
      type: error?.type,
      body: error?.body
    });
    
    // Check if all models failed - try one more time with a delay
    if (error?.message === "All models failed" || error?.statusCode === 429) {
      const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body || {};
      
      if (errorBody.code === "3505" || errorBody.type === "service_tier_capacity_exceeded") {
        console.log("⏳ All models at capacity, trying retry with delay...");
        try {
          // Retry once with delay if we have the text
          if (text && userPrompt) {
            const translation = await tryTranslateWithRetry(text, userPrompt, 2000, 1);
            
            // Clean up translation
            let cleanTranslation = translation
              .replace(/^(Translation:|Result:|Output:)\s*/i, '')
              .replace(/^\*\*|\*\*$/g, '')
              .replace(/#\w+/g, '')
              .replace(/\*\*([^*]+)\*\*/g, '$1')
              .replace(/^["']|["']$/g, '')
              .replace(/^Translation:\s*/i, '')
              .trim();

            // If it's too long, truncate to first 2 sentences max
            const sentences = cleanTranslation.split(/[.!?]+\s/);
            if (sentences.length > 2) {
              cleanTranslation = sentences.slice(0, 2).join('. ') + '.';
            }
            
            // Additional truncation if still too long (more than 140 characters)
            if (cleanTranslation.length > 140) {
              const words = cleanTranslation.split(' ');
              cleanTranslation = words.slice(0, 25).join(' ') + '...';
            }

            return NextResponse.json({ translation: cleanTranslation });
          }
        } catch (retryError) {
          console.error("❌ Retry also failed");
        }
      }
      
      return NextResponse.json(
        { 
          error: "model_capacity_exceeded",
          message: "all models are at capacity rn 😭 servers are busy, try again in a few seconds"
        },
        { status: 429 }
      );
    }
    
    // Handle 429 rate limit errors
    if (error?.statusCode === 429 || error?.status === 429) {
      const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body || {};
      
      // General rate limit/quota errors
      if (error?.message?.includes("quota") || error?.message?.includes("rate limit")) {
        return NextResponse.json(
          { 
            error: "api_quota_exceeded",
            message: "bro's api key ran out of credits 💀 check your billing"
          },
          { status: 429 }
        );
      }
      
      // Generic 429
      return NextResponse.json(
        { 
          error: "rate_limit",
          message: "too many requests 💀 slow down for a sec"
        },
        { status: 429 }
      );
    }
    
    if (error?.statusCode === 401 || error?.status === 401 || error?.message?.includes("unauthorized") || error?.message?.includes("api key")) {
      return NextResponse.json(
        { 
          error: "api_key_invalid",
          message: "invalid api key fr 💀 check your .env.local"
        },
        { status: 401 }
      );
    }
    
    // Final fallback - return a generic roast message
    return NextResponse.json(
      { 
        error: "translation_failed",
        message: "api is acting up rn 💀 try again in a sec or blame the servers"
      },
      { status: 500 }
    );
  }
}

