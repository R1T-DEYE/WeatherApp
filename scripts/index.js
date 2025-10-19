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
}