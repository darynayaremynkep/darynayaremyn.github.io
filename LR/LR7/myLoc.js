let watchId = null;
let map;
let currentMarker = null;
let destinationMarker = null;
let currentPosition = null;
let destinationPosition = null;
let locationTrail = [];

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  map = L.map("map").setView([48.943101, 24.733615], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
const mapContainer = document.getElementById("map");

const resizeObserver = new ResizeObserver(() => {
  map.invalidateSize({ pan: false });
});

resizeObserver.observe(mapContainer);

setTimeout(() => {
  map.invalidateSize({ pan: false });
}, 300);
const collegeLat = 48.943101;
const collegeLon = 24.733615;

$("destLat").value = collegeLat;
$("destLon").value = collegeLon;

setDestination();

  $("locateButton").addEventListener("click", getMyLocation);
  $("watchButton").addEventListener("click", watchMyLocation);
  $("clearWatchButton").addEventListener("click", stopWatching);
  $("setDestinationButton").addEventListener("click", setDestination);
  $("goToDestinationButton").addEventListener("click", goToDestination);
});

function getMyLocation() {
  if (!navigator.geolocation) {
    $("status").textContent = "Ваш браузер не підтримує Geolocation API.";
    return;
  }

  $("status").textContent = "Визначаємо місцезнаходження…";
  navigator.geolocation.getCurrentPosition(displayLocation, displayError, {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  });
}

function displayLocation(position) {
  currentPosition = {
    lat: position.coords.latitude,
    lon: position.coords.longitude
  };

  const time = new Date(position.timestamp);
  const timeText = time.toLocaleString("uk-UA");

  $("latitude").textContent = currentPosition.lat.toFixed(6);
  $("longitude").textContent = currentPosition.lon.toFixed(6);
  $("accuracy").textContent = `± ${Math.round(position.coords.accuracy)} м`;
  $("timestamp").textContent = timeText;
  $("status").textContent = "Місцезнаходження успішно визначено.";

  const popup = `<strong>Моє місцезнаходження</strong><br>
    Широта: ${currentPosition.lat.toFixed(6)}<br>
    Довгота: ${currentPosition.lon.toFixed(6)}<br>
    Точність: ± ${Math.round(position.coords.accuracy)} м<br>
    Час: ${timeText}`;

  const marker = L.marker([currentPosition.lat, currentPosition.lon])
    .addTo(map)
    .bindPopup(popup);
  locationTrail.push(marker);
  currentMarker = marker;
  marker.openPopup();
  map.setView([currentPosition.lat, currentPosition.lon], 15);

  updateDistance();
}

function displayError(error) {
  const messages = {
    1: "Доступ до місцезнаходження заборонено. Дозвольте його в налаштуваннях браузера.",
    2: "Не вдалося визначити місцезнаходження. Перевірте GPS або мережу.",
    3: "Час очікування визначення місцезнаходження вичерпано."
  };
  $("status").textContent = messages[error.code] || "Сталася невідома помилка визначення місцезнаходження.";
}

function computeDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const earthRadius = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function setDestination() {
  const lat = Number($("destLat").value);
  const lon = Number($("destLon").value);

  if ($("destLat").value.trim() === "" || $("destLon").value.trim() === "" ||
      !Number.isFinite(lat) || !Number.isFinite(lon) ||
      lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    $("destinationStatus").textContent = "Введіть коректні координати: широта від −90 до 90, довгота від −180 до 180.";
    return;
  }

  destinationPosition = { lat, lon };
  if (destinationMarker) map.removeLayer(destinationMarker);

  destinationMarker = L.marker([lat, lon])
    .addTo(map)
    .bindPopup(`<strong>Пункт призначення</strong><br>Широта: ${lat.toFixed(6)}<br>Довгота: ${lon.toFixed(6)}`);

  $("destinationStatus").textContent = "Пункт призначення позначено на карті.";
  destinationMarker.openPopup();
  map.setView([lat, lon], 13);
  updateDistance();
}

function updateDistance() {
  if (!currentPosition || !destinationPosition) {
    $("distance").textContent = "—";
    return;
  }

  const distance = computeDistance(
    currentPosition.lat, currentPosition.lon,
    destinationPosition.lat, destinationPosition.lon
  );
  $("distance").textContent = distance < 1
    ? `${Math.round(distance * 1000)} м`
    : `${distance.toFixed(2)} км`;
}

function goToDestination() {
  if (!destinationPosition) {
    $("destinationStatus").textContent = "Спочатку введіть координати та натисніть «Позначити пункт».";
    return;
  }

  map.setView([destinationPosition.lat, destinationPosition.lon], 15);
  destinationMarker.openPopup();
}

function watchMyLocation() {
  if (!navigator.geolocation) {
    $("status").textContent = "Ваш браузер не підтримує Geolocation API.";
    return;
  }

  if (watchId !== null) {
    $("status").textContent = "Відстеження вже ввімкнено.";
    return;
  }

  $("status").textContent = "Відстеження місцезнаходження ввімкнено…";
  watchId = navigator.geolocation.watchPosition(displayLocation, displayError, {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  });
}

function stopWatching() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    $("status").textContent = "Відстеження місцезнаходження зупинено.";
  } else {
    $("status").textContent = "Відстеження наразі не ввімкнено.";
  }
}
