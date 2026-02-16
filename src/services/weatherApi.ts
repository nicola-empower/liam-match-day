
interface WeatherData {
    temp: number;
    condition: string;
    description: string;
}

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const CITY = 'Falkirk';
const COUNTRY = 'GB';
const UNITS = 'metric';

export const getWeather = async (): Promise<WeatherData | null> => {
    if (!API_KEY) {
        console.warn("Weather API Key missing");
        return null;
    }

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY}&units=${UNITS}&appid=${API_KEY}`
        );

        if (!response.ok) throw new Error("Weather API Error");

        const data = await response.json();

        // Map simplified condition for our UI
        let condition = "Unknown";
        const main = data.weather[0].main.toLowerCase();

        if (main.includes('cloud')) condition = "Cloudy";
        else if (main.includes('rain') || main.includes('drizzle')) condition = "Wet Pitch";
        else if (main.includes('clear')) condition = "Dry & Firm";
        else if (main.includes('snow')) condition = "Frozen Pitch";
        else condition = data.weather[0].main;

        return {
            temp: Math.round(data.main.temp),
            condition,
            description: data.weather[0].description
        };
    } catch (error) {
        console.error("Error fetching weather:", error);
        return null;
    }
};
