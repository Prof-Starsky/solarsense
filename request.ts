import axios from 'axios';

const url = "https://archive-api.open-meteo.com/v1/archive";

const params: { [key: string]: string } = {
    latitude: "52.52",
    longitude: "13.41",
    start_date: "2024-12-26",
    end_date: "2025-01-09",
    daily: "shortwave_radiation_sum,sunshine_duration,weather_code"
};

axios.get(url, { params })
    .then(response => {
        console.log(response.data);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
