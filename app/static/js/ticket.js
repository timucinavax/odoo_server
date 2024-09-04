let maxSeats = 0;
let selectedSeats = 0;

function showFlights(date) {
    document.querySelectorAll('.date-box').forEach(box => box.classList.remove('active'));
    const selectedBox = document.querySelector(`.date-box[data-date="${date}"]`);
    if (selectedBox) {
        selectedBox.classList.add('active');
    }

    const flightsContainer = document.getElementById('flights-container');
    flightsContainer.innerHTML = '';

    const flights = flightsData.filter(flight => flight.departure_time.startsWith(date));
    flights.length > 0 ? displayFlights(flights) : showNoFlightsMessage();
}

function displayFlights(flights) {
    const logoUrl = window.logoUrl;
    const userRole = window.loggedInUserRole;

    flights.forEach(flight => {
        const priceToShow = userRole === 'agency' ? flight.agency_price : flight.user_price;
        const flightDuration = calculateFlightDuration(flight.departure_time, flight.arrival_time);
        const flightDirectionLabel = flight.flight_direction === 'return' ? 'Dönüş' : 'Gidiş';

        const flightCard = `
            <div class="card">
                <div class="card-left">
                    <div class="time-info">
                        <p><span class="heading">Uçuş Numarası:</span> ${flight.flight_number}</p>
                        <p><span class="heading">Yön:</span> ${flightDirectionLabel}</p>
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
                    <button class="buy-ticket-button" onclick="buyTicket('${flight.flight_number}', '${flight.available_seats}')">Bileti Seç</button>
                </div>
            </div>`;
        document.getElementById('flights-container').innerHTML += flightCard;
    });
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


function passengerInfo(flightNumber, flightAvailableSeats) {
    const flight = flightsData.find(f => f.flight_number === flightNumber);

    if (flight) {
        const passengerCount = document.getElementById(`passenger-count-${flightNumber}-${flightAvailableSeats}`).value;
        const totalPrice = flight.user_price * passengerCount;

        document.getElementById('flight-number-summary').textContent = flight.flight_number;
        document.getElementById('departure-summary').textContent = flight.departure_airport;
        document.getElementById('arrival-summary').textContent = flight.arrival_airport;
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
    const totalPrice = document.getElementById('price-summary').textContent;
    document.getElementById('total-price-summary').textContent = totalPrice;
    activateStep(3);
}

function proceedToPassengerInfo() {
    activateStep(1);
    document.getElementById('confirmationModal').style.display = 'none';
}

function closeModal() {
    document.getElementById('confirmationModal').style.display = 'none';
}

document.addEventListener("DOMContentLoaded", function () {

    if (selectedDate) {
        showFlights(selectedDate);
    }

    document.getElementById('confirm-purchase-button').addEventListener('click', proceedToPassengerInfo);
});
