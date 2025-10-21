const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const forecastResult = document.querySelector(".forecast-result");
const forecastCity = document.querySelector(".forecast-city");
const forecastGrid = document.querySelector(".forecast-grid");

weatherForm.addEventListener("submit", async event => {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (city) {
    try {
      const forecastData = await getForecastData(city);
      displayForecast(forecastData);
    } catch(error) {
      console.error(error);
      displayError(error.message || "Could not fetch forecast data");
    }
  } else {
    displayError("Please Enter A City");
  }
});

async function getForecastData(city) {
  const response = await fetch(`/forecast?city=${encodeURIComponent(city)}`);
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "City not found");
  }
  return await response.json();
}

function displayForecast(data) {
  forecastResult.style.display = "block";
  forecastCity.textContent = `${data.city.name}, ${data.city.country}`;

  // Group forecasts by day and get one forecast per day (around noon)
  const dailyForecasts = {};
  
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dateStr = date.toLocaleDateString();
    const hour = date.getHours();
    
    // Take the forecast closest to noon (12:00)
    if (!dailyForecasts[dateStr] || Math.abs(hour - 12) < Math.abs(dailyForecasts[dateStr].hour - 12)) {
      dailyForecasts[dateStr] = {
        ...item,
        hour: hour,
        dateObj: date
      };
    }
  });

  // Convert to array and take first 5 days
  const forecasts = Object.values(dailyForecasts).slice(0, 5);

  forecastGrid.innerHTML = forecasts.map(item => {
    const date = item.dateObj;
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return `
      <div class="forecast-card">
        <h3>${dayName}</h3>
        <p>${dateStr}</p>
        <p class="forecast-temp">${Math.round(item.main.temp)}°C</p>
        <p style="text-transform: capitalize;">${item.weather[0].description}</p>
        <p>💧 ${item.main.humidity}%</p>
        <p>💨 ${Math.round(item.wind.speed * 3.6)} km/h</p>
      </div>
    `;
  }).join('');
}

function displayError(message) {
  forecastResult.style.display = "block";
  forecastCity.textContent = "";
  forecastGrid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #333; font-size: 1.2rem;">
      ⚠️ ${message}
    </div>
  `;
}