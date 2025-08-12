function roundTo5Rappen(v){ return Math.round(v*20)/20; }
function calculateMonthlyPayment(price, deposit, residual, termMonths, interestRate){
  const principal = price - deposit - residual;
  const r = interestRate/100/12;
  const f = Math.pow(1+r, termMonths);
  const annuity = r === 0 ? (principal/termMonths) : (principal * (r*f)/(f-1));
  return annuity + (residual/termMonths);
}

async function loadCars(){
  // autos.json muss im gleichen Ordner wie index.html liegen
  const urls = ['./autos.json', './autos.json?t='+Date.now()];
  let data = null, lastErr = null;
  for(const u of urls){
    try{
      const res = await fetch(u, {cache:'no-store'});
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if(!Array.isArray(json)) throw new Error('JSON ist keine Liste');
      data = json;
      break;
    }catch(e){ lastErr = e; }
  }
  if(!data) throw lastErr || new Error('Konnte autos.json nicht laden');

  // Mappe autos.json -> internes Format des Listings
  return data.map(c => ({
    vin: c.vin || c.id,
    brand: c.brand || c.make || '',
    model: c.model || '',
    vehicleType: c.body_type || '',
    fuel: c.fuel_type || '',
    price: c.price_chf ?? null,
    firstRegistration: (c.first_registration && c.first_registration.length===7) ? (c.first_registration + '-01') : (c.first_registration || ''),
    mileage: c.mileage_km ?? null,
    power: c.power_hp ?? null,
    color: c.color_ext || '',
    gearbox: c.transmission || '',
    drive: c.drive || '',
    condition: 'Occasion',
    image: Array.isArray(c.images) && c.images.length ? c.images[0] : null
  })).filter(x => x.price != null);
}

function populateSelect(select, values){
  const set = [...new Set(values.filter(Boolean))].sort();
  set.forEach(v => { const o=document.createElement('option'); o.value=v; o.textContent=v; select.appendChild(o); });
}

function getWishlist(){ const it = localStorage.getItem('wishlist'); return it ? JSON.parse(it) : []; }
function updateWishlistCount(){ const span=document.getElementById('wishlistCount'); if(span) span.textContent=getWishlist().length; }
function toggleWishlist(vin, star){ let list=getWishlist(); const i=list.indexOf(vin); if(i>=0){list.splice(i,1); star.classList.remove('active');} else {list.push(vin); star.classList.add('active');} localStorage.setItem('wishlist', JSON.stringify(list)); updateWishlistCount(); }

function renderCars(cars){
  const grid = document.getElementById('cardGrid');
  const brand = document.getElementById('brandFilter').value;
  const model = document.getElementById('modelFilter').value;
  const type = document.getElementById('typeFilter').value;
  const fuel = document.getElementById('fuelFilter').value;
  const priceMin = parseFloat(document.getElementById('priceMin').value || '');
  const priceMax = parseFloat(document.getElementById('priceMax').value || '');
  const yearMin = parseInt(document.getElementById('yearMin').value || '', 10);
  const yearMax = parseInt(document.getElementById('yearMax').value || '', 10);
  const mileageMin = parseFloat(document.getElementById('mileageMin').value || '');
  const mileageMax = parseFloat(document.getElementById('mileageMax').value || '');
  const sort = document.getElementById('sortSelect').value;

  let filtered = cars.filter(car=>{
    const y = car.firstRegistration ? new Date(car.firstRegistration).getFullYear() : null;
    return (!brand || car.brand===brand)
        && (!model || car.model===model)
        && (!type || car.vehicleType===type)
        && (!fuel || car.fuel===fuel)
        && (isNaN(priceMin) || car.price>=priceMin)
        && (isNaN(priceMax) || car.price<=priceMax)
        && (isNaN(yearMin) || (y!=null && y>=yearMin))
        && (isNaN(yearMax) || (y!=null && y<=yearMax))
        && (isNaN(mileageMin) || (car.mileage!=null && car.mileage>=mileageMin))
        && (isNaN(mileageMax) || (car.mileage!=null && car.mileage<=mileageMax));
  });

  filtered.sort((a,b)=>{
    switch (sort){
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'year-asc':  return (new Date(a.firstRegistration) - new Date(b.firstRegistration));
      case 'year-desc': return (new Date(b.firstRegistration) - new Date(a.firstRegistration));
      case 'brand':
      default: return a.brand.localeCompare(b.brand);
    }
  });

  grid.innerHTML = '';
  const wishlist = getWishlist();
  filtered.forEach(car=>{
    const card = document.createElement('div');
    card.className = 'card';

    const label = document.createElement('div');
    label.className = 'card-label';
    label.textContent = car.condition || 'Occasion';
    card.appendChild(label);

    const fav = document.createElement('div');
    fav.className = 'card-favorite' + (wishlist.includes(car.vin) ? ' active' : '');
    fav.innerHTML = '&#9733;';
    fav.addEventListener('click', (e)=>{ e.stopPropagation(); toggleWishlist(car.vin, fav); });
    card.appendChild(fav);

    const img = document.createElement('img');
    if (car.image){
      img.src = car.image;
    } else {
      const seed = Array.from(car.vin||'X').reduce((a,ch)=>a+ch.charCodeAt(0),0);
      img.src = `https://source.unsplash.com/collection/190727/400x300?sig=${seed}`;
    }
    img.alt = `${car.brand} ${car.model}`;
    card.appendChild(img);

    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('h3');
    const a = document.createElement('a');
    a.href = `detail.html?vin=${encodeURIComponent(car.vin)}`;
    const full = `${car.brand} ${car.model}`;
    a.textContent = full.length>40 ? full.slice(0,37)+'…' : full;
    title.appendChild(a);
    body.appendChild(title);

    const details = document.createElement('div');
    details.className = 'card-details';
    const yymm = car.firstRegistration ? new Date(car.firstRegistration).toLocaleDateString('de-CH',{month:'2-digit',year:'numeric'}) : '';
    [ `EZ ${yymm}`,
      car.mileage!=null ? `${car.mileage.toLocaleString('de-CH')} km` : '',
      car.power!=null ? `${car.power} PS` : '',
      car.fuel + (car.drive ? ' / ' + car.drive : '')
    ].filter(Boolean).forEach(t=>{ const s=document.createElement('span'); s.textContent=t; details.appendChild(s); });
    body.appendChild(details);

    const priceBox = document.createElement('div');
    priceBox.className = 'card-price';
    const old = document.createElement('div'); old.className='old-price';
    old.textContent = (Math.round(car.price*1.15/100)*100).toLocaleString('de-CH',{style:'currency',currency:'CHF',minimumFractionDigits:0});
    const neu = document.createElement('div'); neu.className='new-price';
    neu.textContent = car.price.toLocaleString('de-CH',{style:'currency',currency:'CHF',minimumFractionDigits:0});
    const monthly = document.createElement('div'); monthly.className='monthly';
    const m = roundTo5Rappen(calculateMonthlyPayment(car.price, car.price*0.2, car.price*0.4, 48, 5.95));
    monthly.textContent = `ab ${m.toLocaleString('de-CH',{style:'currency',currency:'CHF',minimumFractionDigits:2})}/Mt*`;
    priceBox.appendChild(old); priceBox.appendChild(neu); priceBox.appendChild(monthly);
    body.appendChild(priceBox);

    const link = document.createElement('a');
    link.href = `detail.html?vin=${encodeURIComponent(car.vin)}`;
    link.textContent = 'zum Auto';
    body.appendChild(link);

    card.appendChild(body);
    grid.appendChild(card);
  });

  updateWishlistCount();
}

window.addEventListener('DOMContentLoaded', async ()=>{
  const grid = document.getElementById('cardGrid');
  try{
    const cars = await loadCars();

    // Filterwerte befuellen
    const brands = [...new Set(cars.map(c=>c.brand).filter(Boolean))].sort();
    const models = [...new Set(cars.map(c=>c.model).filter(Boolean))].sort();
    const types  = [...new Set(cars.map(c=>c.vehicleType).filter(Boolean))].sort();
    const fuels  = [...new Set(cars.map(c=>c.fuel).filter(Boolean))].sort();
    [['brandFilter',brands],['modelFilter',models],['typeFilter',types],['fuelFilter',fuels]]
      .forEach(([id,vals])=>populateSelect(document.getElementById(id), vals));

    // Events
    ['brandFilter','modelFilter','typeFilter','fuelFilter','priceMin','priceMax','yearMin','yearMax','mileageMin','mileageMax','sortSelect']
      .forEach(id=>{
        const el=document.getElementById(id);
        el.addEventListener('input',()=>renderCars(cars));
        el.addEventListener('change',()=>renderCars(cars));
      });

    // Initial
    renderCars(cars);
  }catch(err){
    console.error(err);
    grid.textContent = 'Fehler beim Laden der Fahrzeugdaten.';
  }
});
