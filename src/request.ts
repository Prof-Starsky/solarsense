import axios from 'axios';

export type WeatherAverages = [number, number];

async function getWeatherData(lat: string, long: string): Promise<Array<WeatherAverages>> {
    const url = "https://archive-api.open-meteo.com/v1/archive";

    const formatDate = (date: Date): string => {
        // Clone the date to avoid mutating the original date
        const newDate = new Date(date);
        
        // Subtract two days
        const day = newDate.getDate();
        newDate.setDate(day - 2);
        
        // Variables for year, month, and day (one-based index for the day)
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0'); // Month is zero-based
        const formattedDay = String(newDate.getDate()).padStart(2, '0'); // Date automatically handles month rollover
        
        return `${year}-${month}-${formattedDay}`;
    };

    const calculateAverages = (data: { shortwave_radiation_sum: number[], sunshine_duration: number[] }): WeatherAverages => {
        const shortwaveAvg = data.shortwave_radiation_sum.reduce((acc, curr) => acc + curr, 0) / data.shortwave_radiation_sum.length;
        const sunshineAvg = data.sunshine_duration.reduce((acc, curr) => acc + curr, 0) / data.sunshine_duration.length;
        return [shortwaveAvg, sunshineAvg];
    };

    const fetchDataForPeriod = async (startDate: string, endDate: string) => {
        const params = {
            latitude: lat,
            longitude: long,
            start_date: startDate,
            end_date: endDate,
            daily: "shortwave_radiation_sum,sunshine_duration"
        };
        const response = await axios.get(url, { params });
        return response.data.daily;
    };

    try {
        const now = new Date();
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
       

        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);

        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);

        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        

        const oneYearData = await fetchDataForPeriod(formatDate(oneYearAgo), formatDate(now));
        const sixMonthsData = await fetchDataForPeriod(formatDate(sixMonthsAgo), formatDate(now));
        const oneMonthData = await fetchDataForPeriod(formatDate(oneMonthAgo), formatDate(now));
        const oneWeekData = await fetchDataForPeriod(formatDate(oneWeekAgo), formatDate(now));

        const oneYearAverages = calculateAverages(oneYearData);
        const sixMonthsAverages = calculateAverages(sixMonthsData);
        const oneMonthAverages = calculateAverages(oneMonthData);
        const oneWeekAverages = calculateAverages(oneWeekData);
        console.log(formatDate(oneMonthAgo));
        console.log(formatDate(sixMonthsAgo));
        console.log(formatDate(oneWeekAgo)); 
        console.log(formatDate(oneYearAgo));

        return [oneYearAverages, sixMonthsAverages, oneMonthAverages, oneWeekAverages];
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error to handle it upstream if needed
    }
}

export { getWeatherData };

// Example Usage
// import { getWeatherData, WeatherAverages } from './path/to/weatherService';

// // Example usage in a React component or another module
// async function fetchAndDisplayWeather() {
//     try {
//         const weatherAverages: Array<WeatherAverages> = await getWeatherData("37.7749", "-122.4194");
//         console.log(weatherAverages);
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }

// fetchAndDisplayWeather();
