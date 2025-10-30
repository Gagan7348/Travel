import React, { createContext, useContext, useState } from 'react';
import { GetPlaceDetails, GetPlacePhoto } from '@/service/GlobalApi';

// Create a new Context for managing place photos
const PlacePhotoContext = createContext();

// Provider component to wrap around parts of your app that need photo data
export function PlacePhotoProvider({ children }) {
const [photoCache, setPhotoCache] = useState({
_lastPlaceResponse: null // Stores the most recent place details response
});

// Function to fetch and cache photo URLs for a given place name
const getPhotoUrl = async (placeName) => {
// If photo already exists in cache, return it immediately
if (photoCache[placeName]) {
return photoCache[placeName];
}

```
try {
  // Query Google Places API for details
  const data = { textQuery: placeName };
  const response = await GetPlaceDetails(data);

  // Store response in cache for potential coordinate extraction
  setPhotoCache(prev => ({
    ...prev,
    _lastPlaceResponse: response
  }));

  // Check if response contains photos
  const photos = response.data?.places?.[0]?.photos;
  if (photos?.length > 0) {
    // Use the first available photo (index 0)
    const photoRef = photos[0].name;
    const photoUrl = await GetPlacePhoto(photoRef);

    // Update cache with fetched photo
    setPhotoCache(prev => ({
      ...prev,
      [placeName]: photoUrl
    }));

    return photoUrl;
  }

  // If no photo found, return null
  return null;
} catch (error) {
  console.error('Error fetching photo:', error);
  return null;
}
```

};

// Provide getPhotoUrl and cache to the context consumers
return (
<PlacePhotoContext.Provider value={{ getPhotoUrl, photoCache }}>
{children}
</PlacePhotoContext.Provider>
);
}

// Hook to access the PlacePhotoContext
export const usePlacePhoto = () => useContext(PlacePhotoContext);
