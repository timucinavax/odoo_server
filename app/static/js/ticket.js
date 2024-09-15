let maxSeats = 0;
let selectedSeats = 0;
let passengerCount = 1;
let selectedSeatIds = [];
let selectedFlight = null;

// Uçuşları gösteren fonksiyon
function showFlights(date = null) {
  const today = new Date().toISOString().split('T')[0];

  document.querySelectorAll('.date-box').forEach(box => box.classList.remove('active'));

  if (date) {
    const selectedBox = document.querySelector(`.date-box[data-date="${date}"]`);
    if (selectedBox) {
      selectedBox.classList.add('active');
    }
  }

  const flightsContainer = document.getElementById('flights-container');
  flightsContainer.innerHTML = '';

  const outboundFlightsByDate = flightsData.filter(flight => {
    const flightDate = flight.departure_time.split(' ')[0];
    return flightDate === date && flightDate >= today && flight.flight_direction === 'outbound';
  });

  const returnFlightsByDate = flightsData.filter(flight => {
    const flightDate = flight.departure_time.split(' ')[0];
    return flightDate === date && flightDate >= today && flight.flight_direction === 'return';
  });

  if (outboundFlightsByDate.length > 0) {
    displayFlights(outboundFlightsByDate, 'Gidiş Uçuşları');
  }

  if (returnFlightsByDate.length > 0) {
    displayFlights(returnFlightsByDate, 'Dönüş Uçuşları');
  }

  if (outboundFlightsByDate.length === 0 && returnFlightsByDate.length === 0) {
    showNoFlightsMessage();
  }
}

// Uçuşları ekrana basan fonksiyon
function displayFlights(flights, header) {
  const logoUrl = window.logoUrl;
  const userRole = window.loggedInUserRole;

  const flightsContainer = document.getElementById('flights-container');
  flightsContainer.innerHTML += `<h2 style="text-align: center; color:#007bff; font-weight: bold;
    font-size: 2rem; margin-top: 10px; margin-bottom: 10px">${header}</h2>`;

  flights.forEach(flight => {
    const priceToShow = userRole === 'agency' ? flight.agency_price : flight.user_price;
    const flightDuration = calculateFlightDuration(flight.departure_time, flight.arrival_time);
    const flightDirectionLabel = flight.flight_direction === 'return' ? 'Dönüş' : 'Gidiş';
    const flightDirectionColor = flight.flight_direction === 'return' ? 'blue' : 'green';

    const flightCard = `
      <div class="card">
        <div class="card-left">
          <div class="time-info">
            <p><span class="heading">Uçuş Numarası:</span> ${flight.flight_number}</p>
            <p><span class="heading">Yön:</span> <span style="color: ${flightDirectionColor};">${flightDirectionLabel}</span></p>
          </div>
          <div class="time-info">
            <p>${flight.departure_time.split(" ")[1]}</p>
            <p>${flight.departure_airport[1]}</p>
          </div>
          <div class="route">
            <div class="route-line"></div>
            <div class="route-logo">
              <img class="route-logo" src="${logoUrl}" />
            </div>
            <div class="route-line"></div>
          </div>
          <div class="time-info">
            <p>${flight.arrival_time.split(" ")[1]}</p>
            <p>${flight.arrival_airport[1]}</p>
          </div>
          <div class="time-info">
            <p><span class="heading">Fiyat:</span> <span id="price-${flight.flight_number}-${flight.available_seats}">${priceToShow ? priceToShow : 'Belirtilmemiş'}</span> TL</p>
            <p><span class="heading">Süre:</span> ${flightDuration}</p>
          </div>
          <div class="time-info">
            <p><span class="heading">Mevcut Koltuklar:</span> ${flight.available_seats}</p>
          </div>
        </div>
        <div class="time-info">
          <label for="passenger-count-${flight.flight_number}-${flight.available_seats}">Kişi Sayısı:</label>
          <input type="number" id="passenger-count-${flight.flight_number}-${flight.available_seats}" class="passenger-count" min="1" max="20" value="1" onchange="updatePrice('${flight.flight_number}', ${priceToShow}, ${flight.available_seats})" />
          <button class="buy-ticket-button" onclick="buyTicket('${flight.flight_number}', ${flight.available_seats})">Bileti Seç</button>
        </div>
      </div>`;
    flightsContainer.innerHTML += flightCard;
  });
}

// Fiyatı güncelleyen fonksiyon
function updatePrice(flightNumber, basePrice, availableSeats) {
  const priceElement = document.getElementById(`price-${flightNumber}-${availableSeats}`);
  if (priceElement) {
    const passengerCountInput = document.getElementById(`passenger-count-${flightNumber}-${availableSeats}`);
    passengerCount = Number(passengerCountInput.value);
    maxSeats = passengerCount;
    const totalPrice = basePrice * passengerCount;
    priceElement.textContent = totalPrice;
  } else {
    console.error(`Element with id 'price-${flightNumber}-${availableSeats}' not found.`);
  }
}

// Tarih kutularını kaydıran fonksiyon
function scrollDates(direction) {
  const dateSelector = document.querySelector('.date-selector');
  const dateBoxes = document.querySelectorAll('.date-box');
  const visibleBoxes = 3; // Aynı anda görünen kutu sayısı
  const boxWidth = dateBoxes[0].offsetWidth + 10; // Bir kutunun genişliği (margin ile)
  const scrollAmount = boxWidth * visibleBoxes; // Her seferinde kaydırılacak piksel miktarı

  if (direction === 'left') {
    dateSelector.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  } else if (direction === 'right') {
    dateSelector.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }
}

// Bilet satın alma işlemi
function buyTicket(flightNumber, flightAvailableSeats) {
  const passengerCountInput = document.getElementById(`passenger-count-${flightNumber}-${flightAvailableSeats}`);
  passengerCount = Number(passengerCountInput.value);
  maxSeats = passengerCount;

  document.getElementById('confirmFlightNumber').textContent = flightNumber;
  document.getElementById('confirmationModal').style.display = 'block';

  passengerInfo(flightNumber, flightAvailableSeats);
}

// Yolcu bilgilerini gösteren fonksiyon
function passengerInfo(flightNumber, flightAvailableSeats) {
  const flight = flightsData.find(f => f.flight_number === flightNumber);

  if (flight) {
    selectedFlight = flight;
    const totalPrice = flight.user_price * passengerCount;

    document.getElementById('flight-number-summary').textContent = flight.flight_number;
    document.getElementById('departure-summary').textContent = flight.departure_airport[1];
    document.getElementById('arrival-summary').textContent = flight.arrival_airport[1];
    document.getElementById('price-summary').textContent = totalPrice;
  }
}

// Yolcu bilgileri adımına geçiş
function proceedToPassengerInfo() {
  activateStep(1);
  document.getElementById('confirmationModal').style.display = 'none';
  generatePassengerForms();
}

// Onay butonuna tıklama olayı
document.getElementById('confirm-purchase-button').addEventListener('click', proceedToPassengerInfo);

// Yolcu formlarını dinamik olarak oluşturan fonksiyon
function generatePassengerForms() {
  const passengerInfoContainer = document.getElementById('passenger-info-form');
  passengerInfoContainer.innerHTML = '';

  for (let i = 1; i <= passengerCount; i++) {
    const passengerForm = `
      <div class="form-section">
        <h3>Yolcu ${i}</h3>
        <div class="form-group">
          <label for="first-name-${i}">Ad / İkinci Adı</label>
          <input type="text" id="first-name-${i}" name="first-name-${i}" required />
        </div>
        <div class="form-group">
          <label for="last-name-${i}">Soyadı</label>
          <input type="text" id="last-name-${i}" name="last-name-${i}" required />
        </div>
        <div class="form-group">
          <label for="gender-${i}">Cinsiyet</label>
          <select id="gender-${i}" name="gender-${i}" required>
            <option value="male">Bay</option>
            <option value="female">Bayan</option>
          </select>
        </div>
        <div class="form-group">
          <label for="birthdate-${i}">Doğum Tarihi</label>
          <input type="date" id="birthdate-${i}" name="birthdate-${i}" required />
        </div>
      </div>
    `;
    passengerInfoContainer.insertAdjacentHTML('beforeend', passengerForm);
  }
}

// Koltuk seçimi adımına geçiş
function proceedToSeatSelection(event) {
  event.preventDefault();

  // Yolcu formlarının doğruluğunu kontrol ediyoruz
  const passengerInfoForm = document.getElementById('passenger-info-form');
  if (!passengerInfoForm.checkValidity()) {
    alert('Lütfen tüm yolcu bilgilerini doldurun.');
    return;
  }

  const flightNumber = document.getElementById('flight-number-summary').textContent;
  const flight = flightsData.find(f => f.flight_number === flightNumber);

  if (flight) {
    selectedFlight = flight;
    activateStep(2);
    loadSeatSelection(flight.id);
  }
}

// Koltuk seçim ekranını yükleyen fonksiyon
function loadSeatSelection(flight_id) {
  const seatSelectionContainer = document.getElementById('seat-selection-container');

  fetch(`/plane_layout/${flight_id}`)
    .then(response => response.text())
    .then(data => {
      seatSelectionContainer.innerHTML = data;
      seatSelectionContainer.style.display = 'block';
      initializeSeatSelection();
    })
    .catch(error => console.error('Koltuk düzeni yüklenirken hata oluştu:', error));
}

// Koltuk seçimini başlatan fonksiyon
function initializeSeatSelection() {
  selectedSeatIds = [];
  selectedSeats = 0;

  const checkboxes = document.querySelectorAll('input[type="checkbox"][name="seat"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
    if (!checkbox.classList.contains('unavailable')) {
      checkbox.disabled = false;
    }
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        selectedSeats++;
        selectedSeatIds.push(this.value);
      } else {
        selectedSeats--;
        selectedSeatIds = selectedSeatIds.filter(id => id !== this.value);
      }

      if (selectedSeats >= maxSeats) {
        checkboxes.forEach(box => {
          if (!box.checked && !box.classList.contains('unavailable')) {
            box.disabled = true;
          }
        });
      } else {
        checkboxes.forEach(box => {
          if (!box.checked && !box.classList.contains('unavailable')) {
            box.disabled = false;
          }
        });
      }
    });
  });
}

// Ödeme adımına geçiş ve koltukları kullanıcıya atama
function proceedToPayment() {
  if (selectedSeatIds.length !== passengerCount) {
    alert('Lütfen yolcu sayısına eşit sayıda koltuk seçiniz.');
    return;
  }

  // Rezervasyon verilerini hazırlıyoruz
  const reservationData = {
    flightId: selectedFlight.id,
    seats: selectedSeatIds,
    totalPrice: document.getElementById('price-summary').textContent,
  };

  // Koltukları sunucuya atamak için POST isteği gönderiyoruz
  fetch('/assign_seats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reservationData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Koltuk ataması başarılıysa ödeme adımına geçiyoruz
      activateStep(3);

      const priceSummaryElement = document.getElementById('price-summary');
      const totalPriceElement = document.getElementById('total-price-summary');

      if (priceSummaryElement && totalPriceElement) {
        totalPriceElement.textContent = priceSummaryElement.textContent + ' TL';
      }
    } else {
      alert('Koltuk ataması sırasında bir hata oluştu: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Koltuk ataması sırasında bir hata oluştu. Lütfen tekrar deneyiniz.');
  });
}

// Ödeme işlemini tamamlayan fonksiyon
function completePayment() {
  // Ödeme işlemleri burada gerçekleştirilebilir
  // Ödeme işlemi tamamlandıktan sonra kullanıcıya bilgi veriyoruz
  alert('Ödemeniz başarıyla tamamlandı. Rezervasyonunuz oluşturuldu!');
  window.location.href = '/home'; // Veya rezervasyon detaylarına yönlendirebilirsiniz
}

// Ödeme butonuna tıklama olayını dinliyoruz
document.getElementById('complete-payment-button').addEventListener('click', completePayment);

// Modalı kapatan fonksiyon
function closeModal() {
  document.getElementById('confirmationModal').style.display = 'none';
}

// Adımları yönetmek için kullanılan fonksiyon
function activateStep(stepNumber) {
  document.querySelectorAll('.step-container > div').forEach(div => {
    div.style.display = 'none';
  });

  if (stepNumber === 2) {
    document.getElementById('seat-selection-container').style.display = 'block';
  } else if (stepNumber === 3) {
    document.querySelector(`.step-container > div[data-number="3"]`).style.display = 'block';
  } else {
    document.querySelector(`.step-container > div[data-number="${stepNumber}"]`).style.display = 'block';
  }

  document.querySelectorAll('.breadcrumb-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`.breadcrumb-item[data-number="${stepNumber}"]`).classList.add('active');
}

// Uçuş bulunamadığında gösterilen mesaj
function showNoFlightsMessage() {
  document.getElementById('flights-container').innerHTML = '<div class="no-flights" style="text-align: center;">Bu tarihte uçuş bulunmamaktadır.</div>';
}

// Uçuş süresini hesaplayan fonksiyon
function calculateFlightDuration(departureTime, arrivalTime) {
  const departure = new Date(departureTime);
  const arrival = new Date(arrivalTime);
  const durationMs = arrival - departure;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}
