let maxSeats = 0;
let selectedSeats = 0;


function showFlights(date = null) {
    const today = new Date().toISOString().split('T')[0];

    // Get unique dates from the flights data
    const uniqueDates = [...new Set(flightsData.map(flight => flight.departure_time.split(' ')[0]))].sort();

    // Clear the date selector and generate new date boxes
    const dateSelector = document.getElementById('date-selector');
    dateSelector.innerHTML = '';

    uniqueDates.forEach(flightDate => {
        const outboundCount = flightsData.filter(flight => flight.departure_time.split(' ')[0] === flightDate && flight.flight_direction === 'outbound').length;
        const returnCount = flightsData.filter(flight => flight.departure_time.split(' ')[0] === flightDate && flight.flight_direction === 'return').length;

        const dateBox = `
            <div class="date-box" data-date="${flightDate}" onclick="showFlights('${flightDate}')">
                <div class="flight-counts">
                    <div class="count-box">
                        <span class="flight-count outbound-count" style="color: green">${outboundCount}</span>
                        <span class="flight-label">Gidiş</span>
                    </div>
                    <div class="count-box">
                        <span class="flight-count return-count" style="color: blue">${returnCount}</span>
                        <span class="flight-label">Dönüş</span>
                    </div>
                </div>
                <div class="day-number">${flightDate.split('-')[2]}</div>
                <div class="day-name">${new Date(flightDate).toLocaleString('tr-TR', { weekday: 'long' })}</div>
                <div class="month-name">${new Date(flightDate).toLocaleString('tr-TR', { month: 'long' })}</div>
            </div>
        `;

        dateSelector.innerHTML += dateBox;
    });

    document.querySelectorAll('.date-box').forEach(box => box.classList.remove('active'));
    if (date) {
        const selectedBox = document.querySelector(`.date-box[data-date="${date}"]`);
        if (selectedBox) {
            selectedBox.classList.add('active');
        }
    }

    const flightsContainer = document.getElementById('flights-container');
    flightsContainer.innerHTML = '';

    const outboundFlights = flightsData.filter(flight => {
        const flightDate = flight.departure_time.split(' ')[0];
        return (!date || flightDate === date) && flightDate >= today && flight.flight_direction === 'outbound';
    });

    const returnFlights = flightsData.filter(flight => {
        const flightDate = flight.departure_time.split(' ')[0];
        return (!date || flightDate === date) && flightDate >= today && flight.flight_direction === 'return';
    });

    // Display flights
    if (outboundFlights.length > 0) {
        displayFlights(outboundFlights, 'Gidiş Uçuşları');
    }

    if (returnFlights.length > 0) {
        displayFlights(returnFlights, 'Dönüş Uçuşları');
    }

    if (outboundFlights.length === 0 && returnFlights.length === 0) {
        showNoFlightsMessage();
    }
}
function updatePrice(flightNumber, basePrice, availableSeats) {
    const priceElement = document.getElementById(`price-${flightNumber}-${availableSeats}`);
    if (priceElement) {
        const passengerCount = document.getElementById(`passenger-count-${flightNumber}-${availableSeats}`).value;
        maxSeats = passengerCount;
        const totalPrice = basePrice * passengerCount;
        priceElement.textContent = totalPrice;
    } else {
        console.error(`Element with id 'price-${flightNumber}-${availableSeats}' not found.`);
    }
}


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

function passengerInfo(flightNumber, flightAvailableSeats) {
    const flight = flightsData.find(f => f.flight_number === flightNumber);

    if (flight) {
        const passengerCount = document.getElementById(`passenger-count-${flightNumber}-${flightAvailableSeats}`).value;
        const totalPrice = flight.user_price * passengerCount;

        document.getElementById('flight-number-summary').textContent = flight.flight_number;
        document.getElementById('departure-summary').textContent = flight.departure_airport[1];
        document.getElementById('arrival-summary').textContent = flight.arrival_airport[1];
        document.getElementById('price-summary').textContent = totalPrice; 
    }
}

function buyTicket(flightNumber, flightAvailableSeats) {
    document.getElementById('confirmFlightNumber').textContent = flightNumber;
    document.getElementById('confirmationModal').style.display = 'block';

    passengerInfo(flightNumber ,flightAvailableSeats);
    document.getElementById('seat-selection-container').style.display = 'block';
}

function proceedToSeatSelection(event) {
    event.preventDefault();

    const flightNumber = document.getElementById('flight-number-summary').textContent;
    const flight = flightsData.find(f => f.flight_number === flightNumber);

    if (flight) {
        activateStep(2);
        loadSeatSelection(flight.id);
    }
}

function loadSeatSelection(flight_id) {
    const seatSelectionContainer = document.getElementById('seat-selection-container');

    fetch(`/plane_layout/${flight_id}`)
        .then(response => response.text())
        .then(data => {
            seatSelectionContainer.innerHTML = data;
            seatSelectionContainer.style.display = 'block';
            initializeSeatSelection(); // Seat selection işlemini başlat
        })
        .catch(error => console.error('Error loading seat layout:', error));
}

function initializeSeatSelection() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                selectedSeats++;
            } else {
                selectedSeats--;
            }
            
            if (selectedSeats >= maxSeats) {
                checkboxes.forEach(box => {
                    if (!box.checked) {
                        box.disabled = true;
                    }
                });
            } else {
                checkboxes.forEach(box => {
                    box.disabled = false;
                });
            }
        });
    });
}

function showNoFlightsMessage() {
    document.getElementById('flights-container').innerHTML = '<div class="no-flights" style="text-align: center;" >Bu tarihte uçuş bulunmamaktadır.</div>';
}

function toggleDetails(button) {
    const detailsContent = button.nextElementSibling;
    const isVisible = detailsContent.style.display === 'block';
    detailsContent.style.display = isVisible ? 'none' : 'block';
    button.classList.toggle('collapsed', !isVisible);
}

function calculateFlightDuration(departureTime, arrivalTime) {
    const duration = new Date(new Date(arrivalTime) - new Date(departureTime));
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

function activateStep(stepNumber) {
    console.log("Aktif adım:", stepNumber); // Adım numarasını konsolda kontrol etmek için
    document.querySelectorAll('.step-container > div').forEach(div => {
        div.style.display = 'none';
    });

    if (stepNumber === 2) {
        document.getElementById('seat-selection-container').style.display = 'block';
    } else if (stepNumber === 3) {
        proceedToPayment();
    } else {
        document.querySelector(`.step-container > div[data-number="${stepNumber}"]`).style.display = 'block';
    }

    document.querySelectorAll('.breadcrumb-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.breadcrumb-item[data-number="${stepNumber}"]`).classList.add('active');
}

function proceedToPayment() {
    const priceSummaryElement = document.getElementById('price-summary');
    const totalPriceElement = document.getElementById('total-price-summary');

    if (priceSummaryElement && totalPriceElement) {
        totalPriceElement.textContent = priceSummaryElement.textContent + ' TL';
    }

    // Adım değişikliğini ve sayfa görünümünü güncelle
    document.querySelectorAll('.step-container > div').forEach(div => {
        div.style.display = 'none';
    });

    document.querySelector(`.step-container > div[data-number="3"]`).style.display = 'block';

    document.querySelectorAll('.breadcrumb-item').forEach(item => {
        item.classList.remove('active');
    });

    document.querySelector(`.breadcrumb-item[data-number="3"]`).classList.add('active');
}

function proceedToPassengerInfo() {
    activateStep(1);
    document.getElementById('confirmationModal').style.display = 'none';
}
document.getElementById('confirm-purchase-button').addEventListener('click', proceedToPassengerInfo);

function closeModal() {
    document.getElementById('confirmationModal').style.display = 'none';
}



