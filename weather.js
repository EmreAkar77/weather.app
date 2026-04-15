const express = require("express");
const axios = require("axios")
const app = express();
require("dotenv").config();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index", {weather: null, daily: null, error:null});
});

app.get("/weather", async(req, res) => {
    const city = req.query.city;
    const apiKey = process.env.API_KEY;
    const APIUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    let weather = null;
    let errorMessage = null;

    let daily = null;
    let daily15 = null;

    try {
        const response = await axios.get(APIUrl);
        const data = response.data;

        const sunrise = data.sys.sunrise;
        const sunriseTime = new Date(sunrise * 1000).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Istanbul"
        });
        const sunset = data.sys.sunset;
        const sunsetTime = new Date(sunset * 1000).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Istanbul"
        });
        const date = data.dt;
        const dateObj = new Date(date * 1000);
        const time = dateObj.toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Istanbul"
        });
        const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
        const dayName = days[dateObj.getDay()];
        const dateTime = new Date(date * 1000).toLocaleString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
        const translate = {
            "Clear": "Güneşli", "Clouds": "Bulutlu", "Rain": "Yağmurlu", "Drizzle": "Çiseleyen yağmur", "Thunderstorm": "Fırtına", "Snow": "Karlı",
            "Mist": "Sisli", "Fog": "Sisli", "Haze": "Puslu", "Smoke": "Dumanlı", "Dust": "Tozlu", "Sand": "Kumlu", "Ash": "Küllü", "Squall": "Sağanak",
            "Tornado": "Tornado"
        };

        weather = {
            city: data.name,
            temperature: Math.round(data.main.temp),
            temp_min : Math.round(data.main.temp_min),
            temp_max : Math.round(data.main.temp_max),
            pressure : data.main.pressure,
            description: translate[data.weather[0].main] || data.weather[0].description,
            icon: data.weather[0].icon,
            humidity: data.main.humidity,
            wind: Math.round(data.wind.speed * 3.6),
            visibility: (data.visibility / 1000),
            feels_like: Math.round(data.main.feels_like),
            sunrise: sunriseTime,
            sunset: sunsetTime,
            date: dateTime,
            day: dayName,
            time: time
        };

        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
        const forecastResponse = await axios.get(forecastUrl);
        const forecastData = forecastResponse.data;

        daily15 = [];

        forecastData.list.forEach(item => {
            if (item.dt_txt.includes("12:00:00")){
                const dateObj = new Date(item.dt * 1000);

                daily15.push({
                    day: days[dateObj.getDay()],
                    date: dateObj.toLocaleDateString("tr-TR"),
                    time: "12:00",
                    temp: Math.round(item.main.temp),
                    icon: item.weather[0].icon
                });
            }
        });

        const week = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
        const weekName = days[dateObj.getDay()];
        const weekTime = new Date(date * 1000).toLocaleString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        const getHour = (dt_txt) => {
            return dt_txt.split(" ")[1].slice(0, 5);
        };

        daily = {
            firstTemp: Math.round(forecastData.list[0].main.temp),
            firstIcon: forecastData.list[0].weather[0].icon,
            firstTime: getHour(forecastData.list[0].dt_txt),

            secondTemp: Math.round(forecastData.list[1].main.temp),
            secIcon: forecastData.list[1].weather[0].icon,
            secTime: getHour(forecastData.list[1].dt_txt),

            thirdTemp: Math.round(forecastData.list[2].main.temp),
            thirdIcon: forecastData.list[2].weather[0].icon,
            thirdTime: getHour(forecastData.list[2].dt_txt),

            fourthTemp: Math.round(forecastData.list[3].main.temp),
            fourthIcon: forecastData.list[3].weather[0].icon,
            fourthTime: getHour(forecastData.list[3].dt_txt),

            fifthTemp: Math.round(forecastData.list[4].main.temp),
            fifthIcon: forecastData.list[4].weather[0].icon,
            fifthTime: getHour(forecastData.list[4].dt_txt),
            
            sixthTemp: Math.round(forecastData.list[5].main.temp),
            sixthIcon: forecastData.list[5].weather[0].icon,
            sixthTime: getHour(forecastData.list[5].dt_txt),

            seventhTemp: Math.round(forecastData.list[6].main.temp),
            seventhIcon: forecastData.list[6].weather[0].icon,
            seventhTime: getHour(forecastData.list[6].dt_txt),

            eighthTemp: Math.round(forecastData.list[7].main.temp),
            eighthIcon: forecastData.list[7].weather[0].icon,
            eighthTime: getHour(forecastData.list[7].dt_txt),

            ninthTemp: Math.round(forecastData.list[8].main.temp),
            ninthIcon: forecastData.list[8].weather[0].icon,
            ninthTime: getHour(forecastData.list[8].dt_txt)
        };

    } catch(err) {
        console.error(err);
        errorMessage = "Şehir bulunamadı veya API hatası";
    }

    res.render("index", {weather, daily, daily15:daily15 || [], error: errorMessage});
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});