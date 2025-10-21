console.log("JS loaded!");

const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const result = document.querySelector(".result");

weatherForm.addEventListener("submit", async event => {
    event.preventDefault();

    const city = cityInput.value;

    if (city){
        try{
            const weatherData = await getWeatherData(city);
            displayWeatherInfo(weatherData);
            //fetch alerts after submission button is pressed
            await fetchWeatherAlerts(weatherData.coord.lat, weatherData.coord.lon);
        }
        catch(error){
            console.error(error);
            displayError(error);
        }
    }
    else{ 
        displayError("Please Enter A City");
    }
});

async function getWeatherData(city) {
    try {
        const response = await fetch(`/weather?city=${encodeURIComponent(city)}`);
        if (!response.ok) throw new Error("City not found");

        const data = await response.json();
        return data;

    } catch (err) {
        displayError("Could not fetch weather data.");
        console.error(err);
    }
}

function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

function displayWeatherInfo(data) {
    result.style.display = "block";
    
    const windDirection = getWindDirection(data.wind.deg);
    const windSpeed = (data.wind.speed * 3.6).toFixed(1); //m/s to kmh
    
    result.innerHTML = `
        <p class="cityDisplay">${data.name}</p>
        <p class="countryDisplay">${data.sys.country}</p>
        <p class="tempDisplay">${Math.round(data.main.temp)}°C</p>
        <p class="weatherDescription">${data.weather[0].description}</p>
        
        <div class="weatherDetails">
            <div class="weatherDetail">
                <p class="detailLabel">Feels Like</p>
                <p class="detailValue">${Math.round(data.main.feels_like)}°C</p>
            </div>
            <div class="weatherDetail">
                <p class="detailLabel">Humidity</p>
                <p class="detailValue">${data.main.humidity}%</p>
            </div>
            <div class="weatherDetail">
                <p class="detailLabel">Min Temp</p>
                <p class="detailValue">${Math.round(data.main.temp_min)}°C</p>
            </div>
            <div class="weatherDetail">
                <p class="detailLabel">Max Temp</p>
                <p class="detailValue">${Math.round(data.main.temp_max)}°C</p>
            </div>
            <div class="weatherDetail">
                <p class="detailLabel">Wind Speed</p>
                <p class="detailValue">${windSpeed} km/h</p>
            </div>
            <div class="weatherDetail">
                <p class="detailLabel">Wind Direction</p>
                <p class="detailValue">${windDirection}</p>
            </div>
        </div>
    `;
}

function displayError(message){
    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.classList.add("errorDisplay");    

    result.textContent = "";
    result.style.display = "flex";
    result.appendChild(errorDisplay);

    // Hide alerts on error
    const alertsSection = document.getElementById("alertsSection");
    if (alertsSection) alertsSection.style.display = "none";
}

async function fetchWeatherAlerts(lat, lon) {
    const alertsSection = document.getElementById("alertsSection");
    const alertsContent = document.getElementById("alertsContent");

    try{
        const response = await fetch(`/alerts?lat=${lat}&lon=${lon}`);
        if (!response.ok) throw new Error("Failed to fetch alerts");
        const alerts = await response.json();

        if (alerts && alerts.length > 0) {
            alertsSection.style.display = "block";
            alertsContent.innerHTML = alerts.map(alert => `
                <div style="margin-bottom:15px;">
                    <strong>${alert.event}</strong><br>
                    <small style="color:#666;">${alert.sender_name}</small><br>
                    <p style="margin-top:8px;">${alert.description}</p>
                </div>
            `).join("");
        } else {
            alertsSection.style.display = "block";
            alertsContent.textContent = "No active weather alerts.";
        }
    } catch (err) {
        console.error(err);
        alertsContent.textContent = "Unable to load alerts.";
        alertsSection.style.display = "block";
    }
}