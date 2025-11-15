import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";

const BASE_URL = 'https://places.googleapis.com/v1/places:searchText';

const config = {
  headers: {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
    'X-Goog-FieldMask': [
      'places.photos',
      'places.displayName',
      'places.id',
    ].join(',')  // Join array as comma-separated string
  }
};

export const GetPlaceDetails = (data) => axios.post(BASE_URL, data, config);
export const PHOTO_REF_URL = 'https://places.googleapis.com/v1/{Name}/media?maxHeightPx=1200&maxWidthPx=1600&key='+import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

// Trip Assistant Chat API
export const processChatMessage = async (userMessage, tripData, chatHistory = []) => {
  try {
    // Initialize the API with your API key
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY);
    
    // Use gemini-2.0-flash-exp model (latest available)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Create system prompt
    const systemPrompt = `You are a helpful Trip Assistant AI for TravellaAI app. You are a travel expert who can both help users refine their existing travel plans and provide general travel advice about destinations worldwide.
      
CAPABILITIES:
1. Modify existing trip itineraries based on user preferences
2. Suggest popular destinations and attractions worldwide
3. Provide sample itineraries for destinations
4. Answer questions about travel logistics, best times to visit, cultural norms, etc.
5. Offer personalized travel recommendations based on interests

Current Trip Details (if the user is asking about modifying this specific trip):
Location: ${tripData.location || tripData.userSelection?.location}
Duration: ${tripData.duration || tripData.userSelection?.duration}
Trip Type: ${tripData.travelType || tripData.userSelection?.travelType}
Budget: ${tripData.budgetType || tripData.userSelection?.budgetType}

Current Itinerary (if relevant):
${JSON.stringify(tripData.itinerary || {}, null, 2)}

User Request: ${userMessage}

RESPONSE GUIDELINES:
1. For itinerary modification requests: Provide a friendly response explaining your suggested changes, then include a JSON block for the modified itinerary
2. For general travel queries: Provide detailed, helpful information about destinations, sample itineraries, or travel advice
3. Keep responses conversational, informative and focused on travel planning
4. When recommending destinations, mention key attractions, best times to visit, and special considerations

IMPORTANT: For itinerary modifications only, include a JSON block at the end between [JSON_START] and [JSON_END] markers. The JSON should match the existing structure. For general travel queries, just provide informative text without JSON.`;

    // Generate content based on the prompt
    const result = await model.generateContent(systemPrompt);
    return result.response.text();
  } catch (error) {
    console.error("Error processing chat message:", error);
    throw error;
  }
};
