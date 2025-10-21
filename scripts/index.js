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


function displayWeatherInfo(data) {
  result.style.display = "flex";
  result.innerHTML = `
    <p class="cityDisplay">${data.name}</p>
    <p class="tempDisplay">${Math.round(data.main.temp)}°C</p>
    <p>${data.weather[0].description}</p>
    <p>Humidity: ${data.main.humidity}%</p>
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
      alertsContent.innerHTML = alerts.map(alert => `
        <div style="margin-bottom:10px;">
          <strong>${alert.event}</strong><br>
          <small>${alert.sender_name}</small><br>
          <p>${alert.description}</p>
        </div>
      `).join("");
    } else {
      alertsContent.textContent = "No active weather alerts.";
    }
  } catch (err) {
    console.error(err);
    alertsContent.textContent = "Unable to load alerts.";
    alertsSection.style.display = "block";
  }
}