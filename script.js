/**
 * Loads the vehicle data from the autos.json file and renders a card for each
 * entry. Provides basic filtering by brand, model, vehicle type, fuel and
 * maximal price. This script is deliberately kept simple for clarity in the
 * prototype. In a production environment you would likely debounce user
 * inputs, handle network errors more gracefully and support more advanced
 * filtering.
 */

// Sample vehicle data. Each entry includes additional fields used in the
// listing and detail views, such as a condition label and drive type. In a
// real implementation these would come from an API. Old prices are
// calculated dynamically rather than stored.
const cars = [
  {
    vin: "BMWX32023",
    brand: "BMW",
    model: "X3",
    vehicleType: "SUV",
    fuel: "Petrol",
    price: 45000,
    firstRegistration: "2023-05-15",
    mileage: 12000,
    power: 190,
    color: "Blue",
    gearbox: "Automatic",
    description: "Gut gepflegt, unfallfrei und mit scheckheftgepflegter Historie.",
    drive: "Allrad",
    condition: "Occasion"
  },
  {
    vin: "AUDIA42022",
    brand: "Audi",
    model: "A4",
    vehicleType: "Limousine",
    fuel: "Diesel",
    price: 38000,
    firstRegistration: "2022-09-01",
    mileage: 20000,
    power: 170,
    color: "Grey",
    gearbox: "Manual",
    description: "Sparsamer Diesel mit umfangreicher Ausstattung und neuen Winterreifen.",
    drive: "Vorderrad",
    condition: "Occasion"
  },
  {
    vin: "VWGOLF2021",
    brand: "Volkswagen",
    model: "Golf",
    vehicleType: "Hatchback",
    fuel: "Petrol",
    price: 25000,
    firstRegistration: "2021-11-20",
    mileage: 30000,
    power: 150,
    color: "White",
    gearbox: "Automatic",
    description: "Kompaktes Fahrzeug mit moderner Ausstattung und hoher Alltagstauglichkeit.",
    drive: "Vorderrad",
    condition: "Occasion"
  },
  {
    vin: "TESLAM32020",
    brand: "Tesla",
    model: "Model 3",
    vehicleType: "Limousine",
    fuel: "Electric",
    price: 55000,
    firstRegistration: "2020-07-30",
    mileage: 40000,
    power: 283,
    color: "Red",
    gearbox: "Automatic",
    description: "Vollelektrische Limousine mit Autopilot, guter Reichweite und wenigen Gebrauchsspuren.",
    drive: "Hinterrad",
    condition: "Occasion"
  }
];

// Helpers for leasing calculation and rounding. These mirror the functions
// used on the detail page so that the listing can display a default monthly
// rate.
function roundTo5Rappen(value) {
  return Math.round(value * 20) / 20;
}
function calculateMonthlyPayment(price, deposit, residual, termMonths, interestRate) {
  const principal = price - deposit - residual;
  const monthlyRate = interestRate / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  let annuity = 0;
  if (monthlyRate === 0) {
    annuity = principal / termMonths;
  } else {
    annuity = principal * (monthlyRate * factor) / (factor - 1);
  }
  const monthlyResidual = residual / termMonths;
  return annuity + monthlyResidual;
}

// Helper to populate a select element with unique values extracted from the
// dataset. An empty option is always inserted first to represent "all".
function populateSelect(select, values) {
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

// Render the list of cars into the grid container based on active filters
// and current sort order. Applies price, year and mileage ranges and
// computes default monthly leasing rate for each car.
function renderCars() {
  const grid = document.getElementById('cardGrid');
  grid.innerHTML = '';
  const brand = document.getElementById('brandFilter').value;
  const model = document.getElementById('modelFilter').value;
  const type = document.getElementById('typeFilter').value;
  const fuel = document.getElementById('fuelFilter').value;
  const priceMinVal = document.getElementById('priceMin').value;
  const priceMaxVal = document.getElementById('priceMax').value;
  const yearMinVal = document.getElementById('yearMin').value;
  const yearMaxVal = document.getElementById('yearMax').value;
  const mileageMinVal = document.getElementById('mileageMin').value;
  const mileageMaxVal = document.getElementById('mileageMax').value;
  const sort = document.getElementById('sortSelect').value;
  const priceMin = priceMinVal ? parseFloat(priceMinVal) : null;
  const priceMax = priceMaxVal ? parseFloat(priceMaxVal) : null;
  const yearMin = yearMinVal ? parseInt(yearMinVal, 10) : null;
  const yearMax = yearMaxVal ? parseInt(yearMaxVal, 10) : null;
  const mileageMin = mileageMinVal ? parseFloat(mileageMinVal) : null;
  const mileageMax = mileageMaxVal ? parseFloat(mileageMaxVal) : null;

  // Filter cars based on selected criteria
  let filtered = cars.filter((car) => {
    const carYear = new Date(car.firstRegistration).getFullYear();
    return (
      (!brand || car.brand === brand) &&
      (!model || car.model === model) &&
      (!type || car.vehicleType === type) &&
      (!fuel || car.fuel === fuel) &&
      (!priceMin || car.price >= priceMin) &&
      (!priceMax || car.price <= priceMax) &&
      (!yearMin || carYear >= yearMin) &&
      (!yearMax || carYear <= yearMax) &&
      (!mileageMin || car.mileage >= mileageMin) &&
      (!mileageMax || car.mileage <= mileageMax)
    );
  });
  // Sort the filtered list
  filtered.sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'year-asc': {
        const ya = new Date(a.firstRegistration).getFullYear();
        const yb = new Date(b.firstRegistration).getFullYear();
        return ya - yb;
      }
      case 'year-desc': {
        const ya = new Date(a.firstRegistration).getFullYear();
        const yb = new Date(b.firstRegistration).getFullYear();
        return yb - ya;
      }
      case 'brand':
      default:
        return a.brand.localeCompare(b.brand);
    }
  });

  // Render each filtered car
  filtered.forEach((car, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    // Label for condition
    const label = document.createElement('div');
    label.className = 'card-label';
    label.textContent = car.condition || 'Occasion';
    card.appendChild(label);
    // Favourite star
    const fav = document.createElement('div');
    fav.className = 'card-favorite';
    fav.innerHTML = '&#9733;';
    // Check if this car is already in wishlist
    const wishlist = getWishlist();
    if (wishlist.includes(car.vin)) {
      fav.classList.add('active');
    }
    fav.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlist(car.vin, fav);
    });
    card.appendChild(fav);
    // Image: use deterministic seed based on VIN to keep consistent images
    const img = document.createElement('img');
    const seed = Array.from(car.vin).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    img.src = `https://source.unsplash.com/collection/190727/400x300?sig=${seed}`;
    img.alt = `${car.brand} ${car.model}`;
    card.appendChild(img);
    const body = document.createElement('div');
    body.className = 'card-body';
    // Create a title element and wrap it in an anchor so that clicking on
    // the title also navigates to the detail page. The anchor inherits
    // styling from the heading via CSS.
    const title = document.createElement('h3');
    const fullTitle = `${car.brand} ${car.model}`;
    const truncated = fullTitle.length > 40 ? fullTitle.slice(0, 37) + '…' : fullTitle;
    const titleLink = document.createElement('a');
    titleLink.href = `detail.html?vin=${encodeURIComponent(car.vin)}`;
    titleLink.textContent = truncated;
    title.appendChild(titleLink);
    body.appendChild(title);
    // Details list
    const details = document.createElement('div');
    details.className = 'card-details';
    const date = new Date(car.firstRegistration);
    const monthYear = date.toLocaleDateString('de-CH', { month: '2-digit', year: 'numeric' });
    const detailLines = [
      `EZ ${monthYear}`,
      `${car.mileage.toLocaleString('de-CH')} km`,
      `${car.power} PS`,
      `${car.fuel}${car.drive ? ' / ' + car.drive : ''}`
    ];
    detailLines.forEach((line) => {
      const p = document.createElement('span');
      p.textContent = line;
      details.appendChild(p);
    });
    body.appendChild(details);
    // Price section
    const priceSection = document.createElement('div');
    priceSection.className = 'card-price';
    // Old price (assume 15% higher than current price and round to nearest 100 CHF)
    const old = Math.round(car.price * 1.15 / 100) * 100;
    const oldP = document.createElement('div');
    oldP.className = 'old-price';
    oldP.textContent = old.toLocaleString('de-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0 });
    priceSection.appendChild(oldP);
    const newP = document.createElement('div');
    newP.className = 'new-price';
    newP.textContent = car.price.toLocaleString('de-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0 });
    priceSection.appendChild(newP);
    // Monthly rate using default leasing parameters: 48 months, 10'000 km (not
    // explicitly used here), Anzahlung 20% des Fahrzeugpreises und
    // Restwert 40% des Preises. Zinssatz wird aus dem Leasingrechner
    // übernommen – falls nicht verfügbar bleibt der Standard 3.5%. In dieser
    // Offline‑Umgebung wird 3.5% verwendet.
    // Calculate a default monthly leasing rate based on Auto Bonau's
    // published example: 48 Monate Laufzeit, 20 % Anzahlung und 40 %
    // Restwert. Der Zinssatz wird aus dem offiziellen Leasingrechner
    // (nominal 5.95 %) übernommen. Diese Werte können bei Bedarf
    // angepasst werden.
    const depositValue = car.price * 0.2;
    const residualValue = car.price * 0.4;
    const interest = 5.95;
    const monthly = roundTo5Rappen(calculateMonthlyPayment(car.price, depositValue, residualValue, 48, interest));
    const monthlyDiv = document.createElement('div');
    monthlyDiv.className = 'monthly';
    monthlyDiv.textContent = `ab ${monthly.toLocaleString('de-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 2 })}/Mt*`;
    priceSection.appendChild(monthlyDiv);
    body.appendChild(priceSection);
    // Details link
    const link = document.createElement('a');
    link.href = `detail.html?vin=${encodeURIComponent(car.vin)}`;
    link.textContent = 'zum Auto';
    body.appendChild(link);
    card.appendChild(body);
    grid.appendChild(card);
  });

  // Update wishlist indicator count
  updateWishlistCount();
}

// Retrieve wishlist from localStorage (returns array of VINs)
function getWishlist() {
  const item = localStorage.getItem('wishlist');
  return item ? JSON.parse(item) : [];
}

// Toggle a car's presence in the wishlist and update the star styling
function toggleWishlist(vin, starEl) {
  let list = getWishlist();
  const index = list.indexOf(vin);
  if (index >= 0) {
    list.splice(index, 1);
    starEl.classList.remove('active');
  } else {
    list.push(vin);
    starEl.classList.add('active');
  }
  localStorage.setItem('wishlist', JSON.stringify(list));
  updateWishlistCount();
}

// Update wishlist indicator count display
function updateWishlistCount() {
  const count = getWishlist().length;
  const span = document.getElementById('wishlistCount');
  if (span) span.textContent = count;
}

// When the page loads set up filters and render cars. Because the
// dataset is embedded above there is no asynchronous fetch involved.
window.addEventListener('DOMContentLoaded', () => {
  try {
    // Populate filter options based on available values in the dataset.
    const brands = [...new Set(cars.map((c) => c.brand))].sort();
    const models = [...new Set(cars.map((c) => c.model))].sort();
    const types = [...new Set(cars.map((c) => c.vehicleType))].sort();
    const fuels = [...new Set(cars.map((c) => c.fuel))].sort();
    populateSelect(document.getElementById('brandFilter'), brands);
    populateSelect(document.getElementById('modelFilter'), models);
    populateSelect(document.getElementById('typeFilter'), types);
    populateSelect(document.getElementById('fuelFilter'), fuels);
    // Attach change listeners to re-render on filter change.
    ['brandFilter','modelFilter','typeFilter','fuelFilter','priceMin','priceMax','yearMin','yearMax','mileageMin','mileageMax','sortSelect'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', renderCars);
        el.addEventListener('change', renderCars);
      }
    });
    // Reset button
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        document.getElementById('brandFilter').value = '';
        document.getElementById('modelFilter').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('fuelFilter').value = '';
        document.getElementById('priceMin').value = '';
        document.getElementById('priceMax').value = '';
        document.getElementById('yearMin').value = '';
        document.getElementById('yearMax').value = '';
        document.getElementById('mileageMin').value = '';
        document.getElementById('mileageMax').value = '';
        document.getElementById('sortSelect').value = 'brand';
        renderCars();
      });
    }
    // Initial render
    renderCars();
  } catch (err) {
    console.error('Fehler beim Laden der Fahrzeugdaten', err);
    const grid = document.getElementById('cardGrid');
    grid.textContent = 'Fehler beim Laden der Fahrzeugdaten.';
  }
});