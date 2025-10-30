/**

* Weather Service for OpenWeatherMap API
* ---
* This module handles fetching and caching weather data (current and forecast)
* from the OpenWeatherMap API. It uses sessionStorage for caching and includes
* retry logic with exponential backoff to handle transient network or API errors.
  */

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY; // API key from environment
const WEATHER_CACHE_DURATION = 30 * 60 * 1000; // Cache validity: 30 minutes
const MAX_RETRY_ATTEMPTS = 3; // Max retry attempts for failed requests
const RETRY_DELAY = 1000; // Initial retry delay: 1 second

/**

* Initialize cache from sessionStorage if previously stored.
* Returns two cache objects: one for current weather and one for forecast.
  */
  const initializeCache = () => {
  try {
  const storedCurrentCache = sessionStorage.getItem('weatherCache_current');
  const storedForecastCache = sessionStorage.getItem('weatherCache_forecast');

  return {
  current: storedCurrentCache ? JSON.parse(storedCurrentCache) : {},
  forecast: storedForecastCache ? JSON.parse(storedForecastCache) : {}
  };
  } catch (error) {
  console.warn('Failed to load weather cache from session storage:', error);
  return { current: {}, forecast: {} };
  }
  };

// In-memory cache (populated from sessionStorage)
const weatherCache = initializeCache();

/**

* Update cache in sessionStorage whenever it changes.
* This keeps the cache persistent across page reloads within the same session.
  */
  const updateSessionCache = (type, cache) => {
  try {
  sessionStorage.setItem(`weatherCache_${type}`, JSON.stringify(cache));
  } catch (error) {
  console.warn(`Failed to update ${type} cache in session storage:`, error);
  }
  };

/**

* Retry helper with exponential backoff.
* ---
* Executes a function multiple times (up to `maxAttempts`),
* waiting an increasing amount of time after each failure.
  */
  const retryWithBackoff = async (fn, maxAttempts = MAX_RETRY_ATTEMPTS, delay = RETRY_DELAY) => {
  let lastError;

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
try {
return await fn(); // Try executing the provided function
} catch (error) {
console.warn(`Attempt ${attempt}/${maxAttempts} failed:`, error.message);
lastError = error;

```
  if (attempt < maxAttempts) {
    // Exponential backoff delay before next attempt
    const backoffDelay = delay * Math.pow(2, attempt - 1);
    await new Promise(resolve => setTimeout(resolve, backoffDelay));
  }
}
```

}

throw lastError; // Throw last encountered error if all retries fail
};

/**

* Fetch current weather for a location.
* ---
* @param {string|Object} location - City name (string) or coordinates ({ lat, lon })
* @param {boolean} useRetry - Whether to apply retry logic
* @returns {Promise<Object>} - Current weather data
  */
  export const getCurrentWeather = async (location, useRetry = true) => {
  if (!location) {
  console.error('Location not provided for weather data');
  return null;
  }

// Normalize city name for consistent cache keys
const normalizedLocation = location.toLowerCase?.().trim?.() || location;

// Check if cached data exists and is still valid
const cachedData = weatherCache.current[normalizedLocation];
if (cachedData && Date.now() - cachedData.timestamp < WEATHER_CACHE_DURATION) {
console.log('Using cached current weather data for', location);
return cachedData.data;
}

// Function to fetch weather data from API
const fetchWeatherData = async () => {
console.log(`Fetching current weather for "${location}"`);
let apiUrl;

```
// Build API URL based on location type
if (typeof location === 'object' && location.lat && location.lon) {
  apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
} else {
  apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(normalizedLocation)}&units=metric&appid=${OPENWEATHER_API_KEY}`;
}

const response = await fetch(apiUrl);

// Handle non-OK responses with proper error messages
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  const errorMessage = errorData.message || response.statusText;
  console.error(`Weather API error (${response.status}): ${errorMessage}`);
  
  if (response.status === 404) throw new Error(`Location "${location}" not found`);
  if (response.status === 401) throw new Error('Invalid API key');
  if (response.status === 429) throw new Error('API rate limit exceeded');
  throw new Error(`Weather API error: ${errorMessage}`);
}

const data = await response.json();

// Cache data with timestamp
weatherCache.current[normalizedLocation] = {
  timestamp: Date.now(),
  data
};

updateSessionCache('current', weatherCache.current); // Update session cache

return data;
```

};

try {
// Use retry mechanism if enabled
return useRetry ? await retryWithBackoff(fetchWeatherData) : await fetchWeatherData();
} catch (error) {
console.error('Error fetching current weather:', error);

```
// Fallback to expired cache if available
if (cachedData) {
  console.log('Returning expired cached data as fallback');
  return cachedData.data;
}

return { error: error.message };
```

}
};

/**

* Fetch 5-day weather forecast for a location.
* ---
* @param {string|Object} location - City name or coordinates
* @param {boolean} useRetry - Whether to apply retry logic
* @returns {Promise<Object>} - Processed forecast data
  */
  export const getWeatherForecast = async (location, useRetry = true) => {
  if (!location) {
  console.error('Location not provided for forecast data');
  return null;
  }

// Normalize location for consistent cache keys
const normalizedLocation = typeof location === 'string'
? location.toLowerCase().trim()
: `${location.lat},${location.lon}`;

// Return cached forecast if still valid
const cachedData = weatherCache.forecast[normalizedLocation];
if (cachedData && Date.now() - cachedData.timestamp < WEATHER_CACHE_DURATION) {
console.log('Using cached forecast data for', location);
return cachedData.data;
}

// Function to fetch forecast from API
const fetchForecastData = async () => {
console.log(`Fetching forecast for "${location}"`);
let apiUrl;

```
if (typeof location === 'object' && location.lat && location.lon) {
  apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
} else {
  apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(normalizedLocation)}&units=metric&appid=${OPENWEATHER_API_KEY}`;
}

const response = await fetch(apiUrl);

if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  const errorMessage = errorData.message || response.statusText;
  console.error(`Forecast API error (${response.status}): ${errorMessage}`);
  
  if (response.status === 404) throw new Error(`Location "${location}" not found`);
  if (response.status === 401) throw new Error('Invalid API key');
  if (response.status === 429) throw new Error('API rate limit exceeded');
  throw new Error(`Weather API error: ${errorMessage}`);
}

const data = await response.json();

// Organize forecast data by day
const processedData = processForecastData(data);

// Cache both raw and processed data
weatherCache.forecast[normalizedLocation] = {
  timestamp: Date.now(),
  data: processedData,
  rawData: data
};

updateSessionCache('forecast', weatherCache.forecast);

return processedData;
```

};

try {
return useRetry ? await retryWithBackoff(fetchForecastData) : await fetchForecastData();
} catch (error) {
console.error('Error fetching weather forecast:', error);

```
// Use expired cache as fallback if available
if (cachedData) {
  console.log('Returning expired cached data as fallback');
  return cachedData.data;
}

return { error: error.message };
```

}
};

/**

* Try to find nearby or alternative cities when a location is not found.
* ---
* @param {string} cityName - Original user-input city name
* @returns {Promise<Array|null>} - List of nearby city suggestions
  */
  export const findNearbyCities = async (cityName) => {
  try {
  const response = await fetch(
  `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=3&appid=${OPENWEATHER_API_KEY}`
  );

  if (!response.ok) return null;

  const data = await response.json();

  // Return simplified city info
  return data.length > 0 ? data.map(city => ({
  name: city.name,
  country: city.country,
  state: city.state,
  lat: city.lat,
  lon: city.lon
  })) : null;
  } catch (error) {
  console.error('Error finding nearby cities:', error);
  return null;
  }
  };

/**

* Process and organize forecast data by day.
* ---
* Groups 3-hour forecast entries into daily summaries (high/low temps, wind, etc.)
* @param {Object} forecastData - Raw forecast data from API
* @returns {Array<Object>} - 5-day processed forecast summary
  */
  const processForecastData = (forecastData) => {
  if (!forecastData || !forecastData.list || !Array.isArray(forecastData.list)) {
  console.error('Invalid forecast data structure:', forecastData);
  return [];
  }

const dailyForecasts = {};

// Group all 3-hour entries by date
forecastData.list.forEach(item => {
const date = new Date(item.dt * 1000);
const day = date.toISOString().split('T')[0]; // YYYY-MM-DD

```
if (!dailyForecasts[day]) {
  dailyForecasts[day] = {
    date: day,
    day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
    temps: [],
    precipitation: [],
    weatherIcons: [],
    descriptions: [],
    winds: []
  };
}

// Push relevant values for daily aggregation
dailyForecasts[day].temps.push(item.main.temp);
dailyForecasts[day].precipitation.push(item.pop || 0);
dailyForecasts[day].weatherIcons.push(item.weather[0].icon);
dailyForecasts[day].descriptions.push(item.weather[0].description);
dailyForecasts[day].winds.push(item.wind.speed);
```

});

// Create summarized data for each day
return Object.values(dailyForecasts).map(day => {
// Find most frequent icon and description for the day
const mostFrequent = (arr) => Object.entries(arr.reduce((acc, val) => {
acc[val] = (acc[val] || 0) + 1;
return acc;
}, {})).sort((a, b) => b[1] - a[1])[0][0];

```
return {
  date: day.date,
  day: day.day,
  high: Math.round(Math.max(...day.temps)),
  low: Math.round(Math.min(...day.temps)),
  precipitation: Math.round(Math.max(...day.precipitation) * 100), // Convert to %
  icon: mostFrequent(day.weatherIcons),
  description: mostFrequent(day.descriptions),
  wind: Math.round((day.winds.reduce((a, b) => a + b, 0) / day.winds.length) * 3.6) // m/s → km/h
};
```

}).slice(0, 5); // Limit to next 5 days
};

/**

* Get weather icon URL using OpenWeatherMap icon code.
  */
  export const getWeatherIconUrl = (iconCode) => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

/**

* Fetch both current weather and forecast together with fallback handling.
* ---
* @param {string} location - City name
* @returns {Promise<Object>} - Object with current, forecast, and error/alts info
  */
  export const getWeatherData = async (location) => {
  try {
  // Fetch both current and forecast data in parallel
  const [current, forecast] = await Promise.all([
  getCurrentWeather(location),
  getWeatherForecast(location)
  ]);

  const currentError = current?.error;
  const forecastError = forecast?.error;

  // If both failed, try to find alternative city suggestions
  if (currentError && forecastError) {
  if (currentError.includes('not found')) {
  const alternatives = await findNearbyCities(location);

  ```
   if (alternatives && alternatives.length > 0) {
     return {
       current: null,
       forecast: null,
       alternatives,
       error: `Location "${location}" not found. Did you mean one of these?`
     };
   }
  ```

  }

  return { current: null, forecast: null, error: currentError };
  }

  return { current, forecast, error: null };

} catch (error) {
console.error('Error in getWeatherData:', error);
return { current: null, forecast: null, error: error.message };
}
};

/**

* Check if the OpenWeather API key is present and valid.
* (Simple length check for sanity)
  */
  export const isApiKeyValid = () => {
  return OPENWEATHER_API_KEY && OPENWEATHER_API_KEY.length > 10;
  };

// Export all functions as default for convenient imports
export default {
getCurrentWeather,
getWeatherForecast,
getWeatherIconUrl,
getWeatherData,
findNearbyCities,
isApiKeyValid
};
