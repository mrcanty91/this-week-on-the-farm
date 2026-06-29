// app.js — wires the UI to geocoding, the Open-Meteo forecast, and the rules engine.
import { evaluate } from "./rules.js";

const form = document.getElementById("location-form");
const input = document.getElementById("location-input");
const geoBtn = document.getElementById("geo-btn");
const results = document.getElementById("results");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = input.value.trim();
  if (!q) return;
  renderPlaceholder(`Looking up "${q}"…`);
  // TODO (build phase): geocode -> fetch Open-Meteo forecast -> evaluate() -> render cards.
});

geoBtn.addEventListener("click", () => {
  renderPlaceholder("Locating you…");
  // TODO (build phase): navigator.geolocation -> forecast -> evaluate() -> render cards.
});

function renderPlaceholder(msg) {
  results.innerHTML = `<p class="results__empty">${msg}</p>`;
  // evaluate() is imported and ready; rules + rendering land in the build phase.
  void evaluate;
}
