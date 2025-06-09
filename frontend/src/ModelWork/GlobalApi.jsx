import axios from 'axios';

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

export const GetPlaceDetails =(data)=>axios.post(BASE_URL, data, config)
export const PHOTO_REF_URL ='https://places.googleapis.com/v1/{Name}/media?maxHeightPx=1200&maxWidthPx=1600&key='+import.meta.env.VITE_GOOGLE_PLACE_API_KEY;
