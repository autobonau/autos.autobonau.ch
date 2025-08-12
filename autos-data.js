// Auto Bonau – Daten-Loader (layout-neutral)
// Fügt Karten in ein Ziel-Element ein, ohne Styles zu setzen.
// Ziel-Container in deiner bestehenden Seite z. B. <div id="autos-grid"></div>
// Unten TARGET_SELECTOR an dein Grid anpassen.

const TARGET_SELECTOR = '#autos-grid'; // anpassen, falls dein Container anders heisst
const JSON_PATHS = [
  './autos.json',
  'https://autobonau.github.io/autos.autobonau.ch/autos.json'
];

function chf(x){ try { return new Intl.NumberFormat('de-CH', {style:'currency', currency:'CHF'}).format(x); } catch { return x; } }

function renderCar(car){
  // markup ohne inline-styles, damit dein bestehendes CSS greift
  const img = Array.isArray(car.images) && car.images.length ? `<img src="${car.images[0]}" alt="">` : '';
  return `
    <article class="vehicle-card">
      <figure class="vehicle-media">${img}</figure>
      <div class="vehicle-body">
        <h3 class="vehicle-title">${(car.brand || car.make || '')} ${(car.model || '')} ${(car.trim ? '– ' + car.trim : '')}</h3>
        <p class="vehicle-meta">
          ${(car.first_registration || '')}${car.mileage_km != null ? ' • ' + car.mileage_km.toLocaleString('de-CH') + ' km' : ''}
        </p>
        <p class="vehicle-price">${car.price_chf != null ? chf(car.price_chf) : ''}</p>
      </div>
    </article>
  `;
}

async function tryFetch(url){
  const res = await fetch(url, {cache:'no-store'});
  if(!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const data = await res.json();
  if(!Array.isArray(data)) throw new Error('JSON ist keine Liste');
  return data;
}

async function loadAutos(){
  const host = document.querySelector(TARGET_SELECTOR);
  if(!host){ console.warn('Zielcontainer nicht gefunden:', TARGET_SELECTOR); return; }

  let lastErr = '';
  for(const baseUrl of JSON_PATHS){
    const url = baseUrl + '?t=' + Date.now();
    try{
      const data = await tryFetch(url);
      host.innerHTML = data.map(renderCar).join('');
      return;
    }catch(e){
      lastErr = String(e);
    }
  }
  host.innerHTML = `<p class="vehicle-error">Fehler beim Laden. ${lastErr}</p>`;
}

document.addEventListener('DOMContentLoaded', loadAutos);
