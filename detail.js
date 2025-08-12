/**
 * Handles fetching a single vehicle by VIN from autos.json and populates the
 * details page. Includes a simple leasing calculator with adjustable
 * parameters and rounding to 5 Rappen (0.05 CHF). This script assumes the
 * dataset remains small enough to fetch entirely client-side.
 */

// Extract query parameters from the URL. Returns an object with key/value
// pairs. For example: detail.html?vin=XYZ will result in { vin: 'XYZ' }.
function getQueryParams() {
  const params = {};
  window.location.search
    .substring(1)
    .split('&')
    .forEach((part) => {
      if (!part) return;
      const [key, value] = part.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
  return params;
}

// Round a value to the nearest 0.05 CHF (5 Rappen). Multiply by 20 to
// convert to increments of 0.05, round to nearest integer and divide back.
function roundTo5Rappen(value) {
  return Math.round(value * 20) / 20;
}

// Calculate the monthly leasing payment based on the given parameters. Uses a
// simple annuity formula for an amortising loan plus the residual value
// amortised over the term. Interest rate is interpreted as an annual rate.
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

// Sample vehicle data. Embedding this here ensures the details page works
// without loading an external JSON file when viewed locally. In a real
// implementation you would fetch this from a server.
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
    description: "Gut gepflegt, unfallfrei und mit scheckheftgepflegter Historie."
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
    description: "Sparsamer Diesel mit umfangreicher Ausstattung und neuen Winterreifen."
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
    description: "Kompaktes Fahrzeug mit moderner Ausstattung und hoher Alltagstauglichkeit."
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
    description: "Vollelektrische Limousine mit Autopilot, guter Reichweite und wenigen Gebrauchsspuren."
  }
];

// Populate the page once the DOM is ready. Builds a rich detail page with
// gallery, pricing, technical data and interactive sections for leasing,
// trade-in and enquiries. The layout mimics the style of autorichner.ch
// while keeping within the Auto Bonau branding.
window.addEventListener('DOMContentLoaded', async () => {
  const params = getQueryParams();
  const vin = params.vin;
  const container = document.getElementById('detailContainer');
  if (!vin) {
    container.textContent = 'Keine Fahrzeugkennung (VIN) angegeben.';
    return;
  }
  try {
    const car = cars.find((c) => c.vin === vin);
    if (!car) {
      container.textContent = 'Fahrzeug nicht gefunden.';
      return;
    }
    // Clear container
    container.innerHTML = '';
    // Add a back button that returns to the vehicle overview. It appears
    // above the gallery and uses the gold CTA styling. When clicked, it
    // navigates back to the listing page (index.html).
    const backBtn = document.createElement('a');
    backBtn.href = 'index.html';
    backBtn.className = 'back-button';
    backBtn.textContent = '← Zurück zur Übersicht';
    container.appendChild(backBtn);
    // ---------- Gallery ----------
    const gallery = document.createElement('div');
    gallery.className = 'detail-gallery';
    // Use deterministic seeds to fetch different images for the same car
    const baseSeed = Array.from(vin).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    for (let i = 0; i < 3; i++) {
      const img = document.createElement('img');
      img.src = `https://source.unsplash.com/collection/190727/600x400?sig=${baseSeed + i}`;
      img.alt = `${car.brand} ${car.model}`;
      gallery.appendChild(img);
    }
    container.appendChild(gallery);
    // ---------- Title and tags ----------
    const titleSection = document.createElement('div');
    titleSection.className = 'detail-title-section';
    const h2 = document.createElement('h2');
    h2.textContent = `${car.brand} ${car.model}`;
    titleSection.appendChild(h2);
    // Subtitle with description (shortened)
    if (car.description) {
      const subtitle = document.createElement('p');
      const truncated = car.description.length > 120 ? car.description.slice(0, 117) + '…' : car.description;
      subtitle.textContent = truncated;
      subtitle.className = 'detail-subtitle';
      titleSection.appendChild(subtitle);
    }
    // Tags (condition)
    const tags = document.createElement('div');
    tags.className = 'detail-tags';
    const tag = document.createElement('span');
    tag.textContent = car.condition || 'Occasion';
    tag.className = 'tag-condition';
    tags.appendChild(tag);
    titleSection.appendChild(tags);
    container.appendChild(titleSection);
    // ---------- Main info row ----------
    const infoRow = document.createElement('div');
    infoRow.className = 'detail-info-row';
    // Left column: technical details
    const leftCol = document.createElement('div');
    leftCol.className = 'detail-left';
    const detailsTable = document.createElement('table');
    detailsTable.className = 'detail-table';
    const rows = [
      ['Erstzulassung', new Date(car.firstRegistration).toLocaleDateString('de-CH', { month: '2-digit', year: 'numeric' })],
      ['Kilometer', car.mileage.toLocaleString('de-CH') + ' km'],
      ['Fahrzeugart', car.vehicleType],
      ['Leistung', car.power + ' PS'],
      ['Treibstoff', car.fuel],
      ['Antrieb', car.drive || ''],
      ['Farbe', car.color],
      ['Getriebe', car.gearbox],
    ];
    rows.forEach(([label, value]) => {
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.textContent = label;
      const td = document.createElement('td');
      td.textContent = value;
      tr.appendChild(th);
      tr.appendChild(td);
      detailsTable.appendChild(tr);
    });
    leftCol.appendChild(detailsTable);
    infoRow.appendChild(leftCol);
    // Right column: price and call-to-actions
    const rightCol = document.createElement('div');
    rightCol.className = 'detail-right';
    // Price card container
    const priceCard = document.createElement('div');
    priceCard.className = 'price-card';
    // Sale price
    const priceDiv = document.createElement('div');
    priceDiv.className = 'price-value';
    priceDiv.textContent = car.price.toLocaleString('de-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0 });
    priceCard.appendChild(priceDiv);
    // Monthly rate
    // Monatsrate berechnet nach Auto Bonau‑Beispiel: 48 Monate Laufzeit,
    // Anzahlung 20 % des Fahrzeugpreises und Restwert 40 %. Als Zinssatz
    // wird der im offiziellen Leasingrechner angegebene nominale Satz von
    // 5,95 % verwendet. Diese Parameter können bei Bedarf angepasst werden.
    const depositValue = car.price * 0.2;
    const residualValue = car.price * 0.4;
    const interestRate = 5.95;
    const monthly = roundTo5Rappen(calculateMonthlyPayment(car.price, depositValue, residualValue, 48, interestRate));
    const monthlyDiv = document.createElement('div');
    monthlyDiv.className = 'price-monthly';
    monthlyDiv.textContent = `ab ${monthly.toLocaleString('de-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 2 })}/Mt*`;
    priceCard.appendChild(monthlyDiv);
    // CTA buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'cta-buttons';
    const buyBtn = document.createElement('button');
    buyBtn.className = 'cta';
    buyBtn.textContent = 'Jetzt kaufen';
    // Öffnet dasselbe Anfrage‑Popup wie die "Anfrage / Angebot" Schaltfläche,
    // damit beide Aktionen das identische Formular verwenden. Dadurch
    // entfällt der separate Alert für den Kauf.
    buyBtn.addEventListener('click', () => {
      const modal = document.getElementById('enquiryModal');
      if (modal) modal.style.display = 'block';
    });
    const leaseBtn = document.createElement('button');
    leaseBtn.className = 'cta secondary';
    leaseBtn.textContent = 'Jetzt leasen';
    // Open the leasing modal when clicked instead of scrolling
    leaseBtn.addEventListener('click', () => {
      const modal = document.getElementById('leaseModal');
      if (modal) modal.style.display = 'block';
    });
    // Create a new button for enquiries; opens the enquiry modal
    const enquiryBtn = document.createElement('button');
    // Use secondary styling for the enquiry button so it appears grey, similar
    // to the leasing button. A separate tertiary style caused style
    // conflicts with other CTA rules.
    enquiryBtn.className = 'cta secondary';
    enquiryBtn.textContent = 'Anfrage / Angebot';
    enquiryBtn.addEventListener('click', () => {
      const modal = document.getElementById('enquiryModal');
      if (modal) modal.style.display = 'block';
    });
    // Test drive button
    const testDriveBtn = document.createElement('button');
    testDriveBtn.className = 'cta secondary';
    testDriveBtn.textContent = 'Probefahrt anfragen';
    testDriveBtn.addEventListener('click', () => {
      const modal = document.getElementById('testDriveModal');
      if (modal) modal.style.display = 'block';
    });
    actionsDiv.appendChild(buyBtn);
    actionsDiv.appendChild(leaseBtn);
    actionsDiv.appendChild(enquiryBtn);
    actionsDiv.appendChild(testDriveBtn);
    priceCard.appendChild(actionsDiv);
    rightCol.appendChild(priceCard);
    infoRow.appendChild(rightCol);
    container.appendChild(infoRow);
    // ---------- Stacked detail sections (no collapsible menus) ----------
    // Remarks / description section
    const remarksSection = document.createElement('div');
    remarksSection.className = 'detail-section';
    const remarksTitle = document.createElement('h3');
    remarksTitle.textContent = 'Bemerkungen';
    remarksSection.appendChild(remarksTitle);
    const remarksContent = document.createElement('p');
    remarksContent.textContent = car.description || 'Keine weiteren Bemerkungen vorhanden.';
    remarksSection.appendChild(remarksContent);
    container.appendChild(remarksSection);

    // Equipment section
    const equipSection = document.createElement('div');
    equipSection.className = 'detail-section';
    const equipTitleEl = document.createElement('h3');
    equipTitleEl.textContent = 'Ausstattung';
    equipSection.appendChild(equipTitleEl);
    const equipListEl = document.createElement('ul');
    ['ABS', 'Klimaanlage', 'Navigationssystem', 'Sitzheizung', 'Bluetooth'].forEach((feat) => {
      const li = document.createElement('li');
      li.textContent = feat;
      equipListEl.appendChild(li);
    });
    equipSection.appendChild(equipListEl);
    container.appendChild(equipSection);

    // Create leasing calculator modal
    const leaseModal = document.createElement('div');
    leaseModal.id = 'leaseModal';
    leaseModal.className = 'modal';
    const leaseContent = document.createElement('div');
    leaseContent.className = 'modal-content';
    // Close button for lease modal
    const leaseClose = document.createElement('span');
    leaseClose.className = 'close';
    leaseClose.innerHTML = '\u00D7';
    leaseClose.addEventListener('click', () => {
      leaseModal.style.display = 'none';
    });
    leaseContent.appendChild(leaseClose);
    const leaseHeaderEl = document.createElement('h3');
    leaseHeaderEl.textContent = 'Leasingrechner';
    leaseContent.appendChild(leaseHeaderEl);
    // helper for modal inputs
    function createLeaseInput(labelText, id, defaultValue) {
      const wrapper = document.createElement('div');
      const label = document.createElement('label');
      label.setAttribute('for', id);
      label.textContent = labelText;
      wrapper.appendChild(label);
      const input = document.createElement('input');
      input.id = id;
      input.type = 'number';
      input.value = defaultValue;
      input.step = '0.01';
      wrapper.appendChild(input);
      return { wrapper, input };
    }
    // Store the fixed vehicle price in a constant.
    const leasePrice = car.price;
    // Create input fields for the adjustable values only. The vehicle price
    // will be displayed as static text rather than an input field.
    const leaseDepositInput = createLeaseInput('Anzahlung (CHF)', 'leaseDepositModal', Math.round(car.price * 0.2));
    const leaseResidualInput = createLeaseInput('Restwert (CHF)', 'leaseResidualModal', Math.round(car.price * 0.4));
    const leaseTermInput = createLeaseInput('Laufzeit (Monate)', 'leaseTermModal', 48);
    // Interest rate label without the "(% p.a.)" suffix. The interest rate
    // remains fixed and cannot be edited.
    const leaseRateInput = createLeaseInput('Zins', 'leaseRateModal', 5.95);
    leaseRateInput.input.readOnly = true;
    // Add a static price row before the adjustable inputs. This row mimics
    // the styling of input fields but is read-only.
    const priceWrapper = document.createElement('div');
    const priceLabel = document.createElement('label');
    priceLabel.textContent = 'Fahrzeugpreis (CHF)';
    priceWrapper.appendChild(priceLabel);
    const priceValue = document.createElement('div');
    priceValue.className = 'lease-static-field';
    priceValue.textContent = leasePrice.toLocaleString('de-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 2 });
    priceWrapper.appendChild(priceValue);
    leaseContent.appendChild(priceWrapper);
    // Append the adjustable input fields in order
    [leaseDepositInput, leaseResidualInput, leaseTermInput, leaseRateInput].forEach(({ wrapper }) => leaseContent.appendChild(wrapper));
    const leaseResult = document.createElement('div');
    leaseResult.className = 'result';
    leaseContent.appendChild(leaseResult);
    function updateLeaseModal() {
      // Use the constant leasePrice (defined above) because the price is
      // displayed as static text and cannot be edited.
      const price = leasePrice;
      const deposit = parseFloat(leaseDepositInput.input.value) || 0;
      const residual = parseFloat(leaseResidualInput.input.value) || 0;
      const term = parseInt(leaseTermInput.input.value, 10) || 1;
      const rate = parseFloat(leaseRateInput.input.value) || 0;
      let m = calculateMonthlyPayment(price, deposit, residual, term, rate);
      m = roundTo5Rappen(m);
      leaseResult.textContent = `${m.toLocaleString('de-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 2 })} pro Monat`;
    }
    [leaseDepositInput.input, leaseResidualInput.input, leaseTermInput.input].forEach((input) => input.addEventListener('input', updateLeaseModal));
    // Initial calculation
    updateLeaseModal();
    // ----- Contact fields for leasing enquiry -----
    const leaseContactHeader = document.createElement('h4');
    leaseContactHeader.textContent = 'Anfrage zum Leasing';
    leaseContent.appendChild(leaseContactHeader);
    function addLeaseContact(labelText, id, type) {
      const label = document.createElement('label');
      label.setAttribute('for', id);
      label.textContent = labelText;
      leaseContent.appendChild(label);
      const input = document.createElement('input');
      input.id = id;
      input.type = type;
      leaseContent.appendChild(input);
    }
    addLeaseContact('Ihr Name','leaseNameModal','text');
    addLeaseContact('Ihre E-Mail-Adresse','leaseEmailModal','email');
    addLeaseContact('Ihre Telefonnummer','leasePhoneModal','tel');
    const leaseMsgLabel = document.createElement('label');
    leaseMsgLabel.setAttribute('for','leaseMessageModal');
    leaseMsgLabel.textContent = 'Ihre Nachricht';
    leaseContent.appendChild(leaseMsgLabel);
    const leaseMsgArea = document.createElement('textarea');
    leaseMsgArea.id = 'leaseMessageModal';
    leaseMsgArea.rows = 4;
    leaseContent.appendChild(leaseMsgArea);
    const leaseSendBtn = document.createElement('button');
    leaseSendBtn.className = 'cta';
    leaseSendBtn.textContent = 'Leasinganfrage senden';
    leaseSendBtn.addEventListener('click', () => {
      alert('Vielen Dank für Ihre Leasinganfrage! Wir werden uns in Kürze bei Ihnen melden.');
      leaseModal.style.display = 'none';
    });
    leaseContent.appendChild(leaseSendBtn);
    leaseModal.appendChild(leaseContent);
    document.body.appendChild(leaseModal);

    // Create enquiry modal
    const enquiryModal = document.createElement('div');
    enquiryModal.id = 'enquiryModal';
    enquiryModal.className = 'modal';
    const enquiryContent = document.createElement('div');
    enquiryContent.className = 'modal-content';
    const enquiryClose = document.createElement('span');
    enquiryClose.className = 'close';
    enquiryClose.innerHTML = '\u00D7';
    enquiryClose.addEventListener('click', () => {
      enquiryModal.style.display = 'none';
    });
    enquiryContent.appendChild(enquiryClose);
    const enqHeader = document.createElement('h3');
    enqHeader.textContent = 'Anfrage / Angebot';
    enquiryContent.appendChild(enqHeader);
    function addEnqInput(labelText, id, type) {
      const label = document.createElement('label');
      label.setAttribute('for', id);
      label.textContent = labelText;
      enquiryContent.appendChild(label);
      const input = document.createElement('input');
      input.id = id;
      input.type = type;
      enquiryContent.appendChild(input);
    }
    addEnqInput('Ihr Name','enqNameModal','text');
    addEnqInput('Ihre E-Mail-Adresse','enqEmailModal','email');
    addEnqInput('Ihre Telefonnummer','enqPhoneModal','tel');
    const msgLabel = document.createElement('label');
    msgLabel.setAttribute('for','enqMessageModal');
    msgLabel.textContent = 'Ihre Nachricht';
    enquiryContent.appendChild(msgLabel);
    const msgArea = document.createElement('textarea');
    msgArea.id = 'enqMessageModal';
    msgArea.rows = 4;
    enquiryContent.appendChild(msgArea);
    const sendBtn = document.createElement('button');
    sendBtn.className = 'cta';
    sendBtn.textContent = 'Anfrage senden';
    sendBtn.addEventListener('click', () => {
      alert('Vielen Dank für Ihre Anfrage! Wir werden uns in Kürze bei Ihnen melden.');
      enquiryModal.style.display = 'none';
    });
    enquiryContent.appendChild(sendBtn);
    enquiryModal.appendChild(enquiryContent);
    document.body.appendChild(enquiryModal);

    // Create test drive modal
    const testDriveModal = document.createElement('div');
    testDriveModal.id = 'testDriveModal';
    testDriveModal.className = 'modal';
    const tdContent = document.createElement('div');
    tdContent.className = 'modal-content';
    // Close button for test drive modal
    const tdClose = document.createElement('span');
    tdClose.className = 'close';
    tdClose.innerHTML = '\u00D7';
    tdClose.addEventListener('click', () => {
      testDriveModal.style.display = 'none';
    });
    tdContent.appendChild(tdClose);
    const tdHeader = document.createElement('h3');
    tdHeader.textContent = 'Probefahrt anfragen';
    tdContent.appendChild(tdHeader);
    // helper for test drive inputs
    function addTDInput(labelText, id, type) {
      const label = document.createElement('label');
      label.setAttribute('for', id);
      label.textContent = labelText;
      tdContent.appendChild(label);
      const input = document.createElement('input');
      input.id = id;
      input.type = type;
      tdContent.appendChild(input);
    }
    // Date and time fields
    addTDInput('Datum der Probefahrt','tdDateModal','date');
    addTDInput('Uhrzeit','tdTimeModal','time');
    addTDInput('Ihr Name','tdNameModal','text');
    addTDInput('Ihre E-Mail-Adresse','tdEmailModal','email');
    addTDInput('Ihre Telefonnummer','tdPhoneModal','tel');
    // Message field
    const tdMsgLabel = document.createElement('label');
    tdMsgLabel.setAttribute('for','tdMessageModal');
    tdMsgLabel.textContent = 'Ihre Nachricht';
    tdContent.appendChild(tdMsgLabel);
    const tdMsgArea = document.createElement('textarea');
    tdMsgArea.id = 'tdMessageModal';
    tdMsgArea.rows = 4;
    tdContent.appendChild(tdMsgArea);
    // Note about confirmation
    const note = document.createElement('p');
    note.className = 'modal-note';
    note.textContent = 'Der Termin muss noch von uns bestätigt werden.';
    tdContent.appendChild(note);
    // Send button for test drive
    const tdSendBtn = document.createElement('button');
    tdSendBtn.className = 'cta';
    tdSendBtn.textContent = 'Probefahrt anfragen';
    tdSendBtn.addEventListener('click', () => {
      alert('Vielen Dank für Ihre Probefahrtanfrage! Wir werden uns in Kürze bei Ihnen melden, um den Termin zu bestätigen.');
      testDriveModal.style.display = 'none';
    });
    tdContent.appendChild(tdSendBtn);
    testDriveModal.appendChild(tdContent);
    document.body.appendChild(testDriveModal);
  } catch (err) {
    console.error('Fehler beim Laden der Fahrzeugdaten', err);
    container.textContent = 'Fehler beim Laden der Fahrzeugdaten.';
  }
});