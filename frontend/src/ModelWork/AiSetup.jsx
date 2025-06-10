import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const AiSetup = () => {
  const [travelData, setTravelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateTravelPlan = async (travelParams) => {
    setLoading(true);
    setError(null);
    try {
      // Initialize the API with your API key
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY);
      
      // Use gemini-1.5-pro model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const prompt = `Generate a detailed Travel Plan in JSON format for:

**Location**: ${travelParams.location || 'Las Vegas'}  
**Duration**: ${travelParams.duration || '3 Days'}  
**For**: ${travelParams.for || 'A couple'}  
**Budget Type**: ${travelParams.budgetType || 'Cheap/Budget-friendly'}  

The response MUST be in VALID JSON format with no formatting errors. Use double quotes for all keys and string values.

Include the following details:

🔹 Hotels List (5 options):
- "hotelName": "name of hotel",
- "hotelAddress": "address",
- "pricePerNight": "price range",
- "hotelImageUrl": "url to stock image",
- "starRating": number between 1-5,
- "amenities": ["Free WiFi", "Pool", "Breakfast", etc.],
- "reviewSummary": "short text"

🔹 Itinerary (Day-wise plan for ${travelParams.duration || '3 days'}):
For each day:
- "placeName": "name",
- "description": "short description",
- "placeType": "Adventure/Romantic/Food/Nightlife",
- "entryTicketPrice": "price if any or Free",
- "openingTime": "time",
- "closingTime": "time", 
- "rating": number between 1-5,
- "bestTimeToVisit": "Morning/Afternoon/Evening"



🔹 Transport Suggestions:
- "localTransportOptions": ["bus", "taxi", "metro", "bike rental"],
- "estimatedDailyCost": "cost estimate",
- "airportToHotelTransport": "method"

🔹 Weather Forecast:
- "weatherPrediction": ["Sunny"/"Rainy"/etc. for each day],
- "averageTemperature": "temperature in °C",
- "whatToCarry": ["sunglasses", "umbrella", etc.]

🔹 Safety Tips:
- "locationPrecautions": ["precaution1", "precaution2"],
- "emergencyNumbers": ["number1", "number2"],
- "safeHoursToTravel": "hours"

Provide ONLY valid JSON with NO explanations or comments outside the JSON. Do not include markdown formatting like triple backticks. Format it properly with correct syntax.`;

      console.log("Sending request to Gemini API...");
      
      // Configure the generation for stricter JSON formatting
      const generationConfig = {
        temperature: 0.1, // Very low temperature for consistent output
        topK: 20,
        maxOutputTokens: 8192,
        responseMimeType: "application/json", // Request JSON response format
      };
      
      // Generate content based on the prompt with configuration
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });
      
      const response = await result.response;
      const text = response.text().trim();
      
      console.log("Received response from API");
      
      // Handle different response formats
      let jsonData = null;
      
      // Try multiple approaches to extract valid JSON
      const extractionMethods = [
        // Method 1: Direct parsing
        () => {
          try {
            return JSON.parse(text);
          } catch (e) {
            console.log("Direct parsing failed:", e.message);
            return null;
          }
        },
        
        // Method 2: Extract JSON from markdown code blocks
        () => {
          const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            try {
              return JSON.parse(jsonMatch[1].trim());
            } catch (e) {
              console.log("Code block parsing failed:", e.message);
              return null;
            }
          }
          return null;
        },
        
        // Method 3: Fix common JSON issues and try parsing
        () => {
          try {
            // Replace single quotes with double quotes
            let fixedText = text.replace(/'/g, '"');
            
            // Fix unquoted property names
            fixedText = fixedText.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
            
            // Ensure commas between array elements and object properties
            fixedText = fixedText.replace(/}\s*{/g, '},{');
            fixedText = fixedText.replace(/]\s*\[/g, '],[');
            fixedText = fixedText.replace(/"\s*}/g, '"}');
            
            return JSON.parse(fixedText);
          } catch (e) {
            console.log("Fixed JSON parsing failed:", e.message);
            return null;
          }
        },
        
        // Method 4: Find any JSON-like structure
        () => {
          const possibleJson = text.match(/\{[\s\S]*\}/);
          if (possibleJson) {
            try {
              return JSON.parse(possibleJson[0]);
            } catch (e) {
              console.log("JSON structure parsing failed:", e.message);
              return null;
            }
          }
          return null;
        }
      ];
      
      // Try each method until one succeeds
      for (const method of extractionMethods) {
        jsonData = method();
        if (jsonData) {
          console.log("Successfully parsed JSON using extraction method");
          break;
        }
      }
      
      // If all parsing methods failed, create a fallback response
      if (!jsonData) {
        console.log("All parsing methods failed. Creating fallback response.");
        jsonData = {
          travelPlan: {
            location: travelParams.location || "Unknown Location",
            duration: travelParams.duration || "3 Days",
            for: travelParams.for || "Unknown Group",
            budgetType: travelParams.budgetType || "Unknown Budget",
            note: "Due to formatting issues, we couldn't generate a detailed plan. Please try again.",
            hotels: [
              {
                hotelName: "Example Hotel",
                hotelAddress: "City Center",
                pricePerNight: "$$",
                starRating: 3,
                amenities: ["WiFi", "Breakfast"]
              }
            ],
            itinerary: [
              {
                day: 1,
                activities: [
                  {
                    placeName: "Local Attraction",
                    description: "Popular tourist spot",
                    entryTicketPrice: "Unknown"
                  }
                ]
              }
            ],
            transportSuggestions: {
              localTransportOptions: ["taxi", "bus"],
              estimatedDailyCost: "Varies"
            }
          },
          rawResponsePreview: text.substring(0, 300) + "..."
        };
      }
      
      setTravelData(jsonData);
      return jsonData;
    } catch (err) {
      console.error("Error generating travel plan:", err);
      setError("Failed to generate travel plan: " + (err.message || "Unknown error"));
      
      // Return a basic error object that the UI can handle
      const errorData = {
        travelPlan: {
          error: true,
          errorMessage: err.message || "Failed to generate travel plan. Please try again later.",
          location: travelParams.location || "Unknown Location", 
          duration: travelParams.duration || "Unknown Duration"
        }
      };
      
      setTravelData(errorData);
      return errorData;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateTravelPlan,
    travelData,
    loading,
    error
  };
};

export default AiSetup;