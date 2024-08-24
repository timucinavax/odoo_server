let selectedFlight = null;

function activateStep(stepNumber) {
    // Tüm breadcrumb öğelerini devre dışı bırak
    document.querySelectorAll('.breadcrumb-item').forEach(item => item.classList.remove('active'));
    
    // Geçerli breadcrumb öğesini aktif yap
    document.querySelector(`.breadcrumb-item[data-number="${stepNumber}"]`).classList.add('active');
    
    // Tüm içerik alanlarını gizle
    document.querySelectorAll('[data-number]').forEach(content => content.style.display = 'none');
    
    // Geçerli içerik alanını göster
    document.querySelector(`[data-number="${stepNumber}"]`).style.display = 'block';
}

function showFlights(date) {
    document.querySelectorAll('.date-box').forEach(box => box.classList.remove('active'));
    document.querySelector(`.date-box[onclick="showFlights('${date}')"]`).classList.add('active');

    const flightsContainer = document.getElementById('flights-container');
    flightsContainer.innerHTML = '';

    const flights = flightsData.filter(flight => flight.departure_time.startsWith(date));
    flights.length > 0 ? displayFlights(flights) : showNoFlightsMessage();
}

function displayFlights(flights) {
    flights.forEach(flight => {
        const flightDuration = calculateFlightDuration(flight.departure_time, flight.arrival_time);
        const flightCard = `
            <div class="card">
                <div class="time-info">
                    <p><span class="heading">Uçuş Numarası:</span> ${flight.flight_number}</p>
                </div>
                <div class="time-info">
                    <p>${flight.departure_time.split(" ")[1]}</p>
                    <p>${flight.departure_airport}</p>
                </div>
                <div class="route">
                    <div class="route-line"></div>
                    <div class="route-logo"></div>
                    <div class="route-line"></div>
                </div>
                <div class="time-info">
                    <p>${flight.arrival_time.split(" ")[1]}</p>
                    <p>${flight.arrival_airport}</p>
                </div>
                <div class="time-info">
                    <p><span class="heading">Fiyat:</span> ${flight.price} TL</p>
                    <p><span class="heading">Süre:</span> ${flightDuration}</p>
                </div>
                <div class="time-info">
                    <button class="buy-ticket-button" onclick="buyTicket('${flight.flight_number}')">Bileti Al</button>
                </div>
            </div>`;
        flightsContainer.innerHTML += flightCard;
    });
}

function showNoFlightsMessage() {
    document.getElementById('flights-container').innerHTML = '<div class="no-flights">Bu tarihte uçuş bulunmamaktadır.</div>';
}

function calculateFlightDuration(departureTime, arrivalTime) {
    const duration = new Date(new Date(arrivalTime) - new Date(departureTime));
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

function buyTicket(flightNumber) {
    selectedFlight = flightsData.find(flight => flight.flight_number === flightNumber);

    if (selectedFlight) {
        document.getElementById('flight-number-summary').textContent = selectedFlight.flight_number;
        document.getElementById('departure-summary').textContent = `${selectedFlight.departure_airport} - ${selectedFlight.departure_time}`;
        document.getElementById('arrival-summary').textContent = `${selectedFlight.arrival_airport} - ${selectedFlight.arrival_time}`;
        document.getElementById('price-summary').textContent = selectedFlight.price;

        proceedToPassengerInfo();
    }
}

function proceedToPassengerInfo() {
    if (selectedFlight) {
        activateStep(1);
    } else {
        alert("Lütfen önce bir uçuş seçin.");
    }
}

function goBackToFlightSelection() {
    activateStep(0);
}

function closeModal() {
    document.getElementById('confirmationModal').style.display = 'none';
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('confirm-purchase-button').addEventListener('click', proceedToPassengerInfo);
});
