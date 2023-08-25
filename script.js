const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const tempDivCentigrade = document.querySelector(".toCentigrade");
const tempDivFahreinheit = document.querySelector(".toFahreinheit");

const API_KEY = "79b24de2f2b2a7584eab726b875298fb";

// converting temperature degrees

tempDivCentigrade.addEventListener("click", (celsius) => {
  var fahrenheit = (celsius * 9) / 5 + 32;
  console.log(fahrenheit);
});

function createWeatherCard(cityName, weatherItem, index) {
  const timestamp = weatherItem.dt;
  const date = new Date(timestamp * 1000);
  const dayAbbreviation = date.toLocaleString("en-US", { weekday: "short" });

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  const formattedTime = `${hours}:${minutes}`;

  const temp = (weatherItem.main.temp - 273.5).toFixed(0);

  if (index === 0) {
    return `
      <div class="flex justify-between">
      <div class="flex gap-1 align-top">
      <div>
        <img src='httpss://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png' alt="">
      </div>
      <div class="flex">
        <span class="text-5xl font-bold">${temp}</span>
        <span>&deg;C</span>
        <span>|&deg;F</span>
      </div>
      <div class="text-[#d9d9d9] text-sm">
        <div class="">Humidity:${weatherItem.main.humidity} </div>
        <div>wind speed:${weatherItem.wind.speed} km/h</div>
      </div>

    </div>

    <div class="text-right text-[#d9d9d9] text-sm">
      <div class="text-[#000] font-bold">Weather</div>
      <div>${dayAbbreviation} ${formattedTime}</div>
      <div>${weatherItem.weather[0].main}</div>
    </div></div>`;
  } else {
    return `<div class="flex flex-col md:justify-between bg-[#f8f9fa] px-2 items-center rounded-lg md:w-[170px] md:h-[170px] md:py-2">
    <div class="text-center text-sm md:text-2xl">${dayAbbreviation}</div>
    <div>
    <img src='httpss://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png' alt="">
    </div>
    <div class="flex justify-between space-x-2 text-sm">
      <span>${temp}&deg;</span>
      <span>${temp}&deg;</span>
    </div>
  </div>`;
  }
}

function getWeatherDetails(cityName, lat, lon) {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      console.log(cityName);
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";
      fiveDaysForecast.forEach((weatherItem, index) => {
        if (index === 0) {
          console.log(weatherItem);
          weatherCardsDiv.insertAdjacentHTML(
            "beforebegin",
            createWeatherCard(cityName, weatherItem, index)
          );
        } else {
          weatherCardsDiv.insertAdjacentHTML(
            "beforeend",
            createWeatherCard(cityName, weatherItem, index)
          );
        }
      });
    })
    .catch(() => {
      alert("An error occured while fetching the weather forecast!");
    });
}

const getCityCoordinates = (evt) => {
  evt.preventDefault();
  const cityName = cityInput.value.trim();
  if (!cityInput) return;

  const GEOCODDING_API_URI = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(GEOCODDING_API_URI)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) return alert(`no coordinates found for ${cityName}`);
      const { name, lat, lon } = data[0];
      getWeatherDetails(name, lat, lon);
      console.log(data);
    })
    .catch(() => {
      alert("an error occured while fecthing the coordinates!");
    });

  console.log(cityName);
};

searchButton.addEventListener("click", getCityCoordinates);

// google.charts.load("current", { packages: ["line"] });
// google.charts.setOnLoadCallback(drawChart);

// function drawChart() {
//   var data = new google.visualization.DataTable();

//   data.addColumn("string", "Topping");
//   data.addColumn("string", "Slices");
//   data.addRows([
//     ["Mushrooms", "3"],
//     ["Onions", "1"],
//     ["Olives", "1"],
//     ["Zucchini", "1"],
//     ["Pepperoni", "2"],
//   ]);

//   var options = {
//     backgroundColor: { fill: "transparent" },
//     chartArea: {
//       backgroundColor: "transparent",
//     },
//   };

//   var chart = new google.charts.Line(
//     document.getElementById("linechart_material")
//   );

//   chart.draw(data, google.charts.Line.convertOptions(options));
// }

// automatically showing weather of the current location after windows fully loads

window.addEventListener("load", () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      fetch(REVERSE_GEOCODING_URL)
        .then((res) => res.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert("an error occured while fecthing the city!");
        });
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          "Geolocation request denied. Please reset location persmission to grant access again."
        );
      }
    }
  );
});
