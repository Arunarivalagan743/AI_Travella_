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
      
      // Use gemini-1.5-pro or gemini-1.0-pro instead of gemini-pro
      // This change is based on the error message suggesting you need to check available models
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const prompt = `Generate a detailed Travel Plan in JSON format for:

**Location**: ${travelParams.location || 'Las Vegas'}  
**Duration**: ${travelParams.duration || '3 Days'}  
**For**: ${travelParams.for || 'A couple'}  
**Budget Type**: ${travelParams.budgetType || 'Cheap/Budget-friendly'}  

Include the following details:

🔹 Hotels List (5 options):
- HotelName
- Hotel Address
- Price (per night)
- Hotel Image URL
- Star Rating (1–5)
- Amenities (Free WiFi, Pool, Breakfast, etc.)
- Review Summary (short text)

🔹 Itinerary (Day-wise plan for ${travelParams.duration || '3 days'}):
For each day:
- placeName
- Description
- Place Type (e.g., Adventure, Romantic, Food, Nightlife)
- Entry Ticket Price (if any)
- Opening & Closing Times
- Rating
- Best Time to Visit (Morning/Afternoon/Evening)

🔹 Dining Recommendations (2 per day):
- Restaurant Name
- Type (Local, Fine Dining, Fast Food)
- Cuisine
- Price Range
- Opening Hours
- One-line review

🔹 Transport Suggestions:
- Local transport options (bus, taxi, metro, bike rental)
- Estimated daily travel cost
- Airport to hotel commute method

🔹 Weather Forecast:
- Predicted weather for each day (e.g., Sunny, Rainy)
- Average temperature (°C)
- What to carry (sunglasses, umbrella, etc.)

🔹 Safety Tips:
- Any location-specific precautions
- Emergency numbers
- Safe hours to travel

📌 All information must be provided in **valid, structured JSON format**.

Make sure to avoid using any non-Latin characters and ensure all JSON keys and values are properly quoted.`;

      console.log("Sending request to Gemini API...");
      
      // Configure the generation to help ensure proper JSON formatting
      const generationConfig = {
        temperature: 0.2, // Lower temperature for more consistent JSON
        topK: 40,
        maxOutputTokens: 8192, // Ensure enough tokens for complete response
      };
      
      // Generate content based on the prompt with configuration
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });
      
      const response = await result.response;
      const text = response.text();
      
      console.log("Received response from API");
      
      // Find JSON content between backticks or just parse the response directly
      let jsonData;
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
      
      if (jsonMatch && jsonMatch[1]) {
        console.log("JSON found in response with backticks");
        try {
          jsonData = JSON.parse(jsonMatch[1]);
        } catch (parseError) {
          console.error("Failed to parse JSON from backticks:", parseError);
          
          // Try cleaning the JSON before giving up
          try {
            // Remove potential non-JSON characters and try again
            const cleanedJson = jsonMatch[1].replace(/[\u0000-\u0019]+/g, "");
            jsonData = JSON.parse(cleanedJson);
            console.log("Successfully parsed cleaned JSON from backticks");
          } catch (cleanError) {
            console.error("Failed to parse cleaned JSON:", cleanError);
            throw new Error("Could not parse JSON from the response");
          }
        }
      } else {
        console.log("Attempting to parse entire response as JSON");
        try {
          // Try to parse the entire response as JSON
          jsonData = JSON.parse(text);
        } catch (parseError) {
          console.error("Failed to parse entire response as JSON:", parseError);
          
          // Final attempt - try to find any JSON-like structure in the text
          const possibleJson = text.match(/\{[\s\S]*\}/);
          if (possibleJson) {
            try {
              const cleanedJson = possibleJson[0].replace(/[\u0000-\u0019]+/g, "");
              jsonData = JSON.parse(cleanedJson);
              console.log("Found JSON structure in response");
            } catch (finalError) {
              console.error("All JSON parsing attempts failed", finalError);
              throw new Error("Could not extract valid JSON from the response");
            }
          } else {
            throw new Error("Could not extract valid JSON from the response");
          }
        }
      }
      
      // Add fallback mechanism if all parsing attempts fail
      if (!jsonData) {
        console.log("Creating a basic placeholder response since parsing failed");
        jsonData = {
          travelPlan: {
            location: travelParams.location || "Unknown Location",
            duration: travelParams.duration || "3 Days",
            error: "Could not generate detailed plan. Please try again later.",
            rawResponse: text.substring(0, 500) + "..." // Store part of the raw response for debugging
          }
        };
      }
      
      setTravelData(jsonData);
      return jsonData; // Return the data for immediate use
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
      return errorData; // Return something the UI can work with
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