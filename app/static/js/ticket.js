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
                <div class="card-left">
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
                </div>
                <div class="card-right">
                    <button class="details-button" onclick="toggleDetails(this)">Seyahat Detayları</button>
                    <div class="details-content">
                        <p><span class="heading">Uçuş Numarası:</span> ${flight.flight_number}</p>
                        <p><span class="heading">Kalkış Zamanı:</span> ${flight.departure_time}</p>
                        <p><span class="heading">Varış Zamanı:</span> ${flight.arrival_time}</p>
                        <p><span class="heading">Fiyat:</span> ${flight.price} TL</p>
                        <p><span class="heading">Uçuş Yönü:</span> ${flight.flight_direction}</p>
                        <p><span class="heading">Koltuk Sayısı:</span> ${flight.available_seats}</p>
                    </div>
                </div>
                <div class="time-info">
                    <button class="buy-ticket-button" onclick="buyTicket('${flight.flight_number}')">Bileti Al</button>
                </div>
            </div>`;
        document.getElementById('flights-container').innerHTML += flightCard;
    });
}

function showNoFlightsMessage() {
    document.getElementById('flights-container').innerHTML = '<div class="no-flights">Bu tarihte uçuş bulunmamaktadır.</div>';
}

function toggleDetails(button) {
    const detailsContent = button.nextElementSibling;
    const isVisible = detailsContent.style.display === 'block';
    detailsContent.style.display = isVisible ? 'none' : 'block';
    button.classList.toggle('collapsed', !isVisible);
}

function buyTicket(flightNumber) {
    alert(`Flight code: ${flightNumber} için bilet alındı.`);
}

function calculateFlightDuration(departureTime, arrivalTime) {
    const duration = new Date(new Date(arrivalTime) - new Date(departureTime));
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}
