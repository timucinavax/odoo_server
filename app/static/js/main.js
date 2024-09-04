document.addEventListener("DOMContentLoaded", function () {
    createCookieConsent();
    handleSearchForm();
    postFlightSearch();
    searchBox();
});

function postFlightSearch() {
    const form = document.querySelector('.search-form');
    const searchButton = document.querySelector('.search-button');

    searchButton.addEventListener('click', function (e) {

        form.submit();
    });
}

function createCookieConsent() {
    const cookieConsent = document.createElement("div");
    cookieConsent.className = "cookie-consent";
    cookieConsent.innerHTML = `
        <p>Sitemizde yasal düzenlemelere uygun çerezler (cookies) kullanıyoruz. Detaylı bilgiye 
        <a href="https://www.sehlentur.com/gizlilik-politikasi-ve-cerez-aydinlatma-metni/">Gizlilik Politikası Ve Çerez Aydınlatma Metni</a> sayfamızdan ulaşabilirsiniz.</p>
        <div class="cookie-buttons">
            <a href="#" class="btn btn-consent">Tamam</a>
            <a href="https://www.sehlentur.com/gizlilik-politikasi-ve-cerez-aydinlatma-metni/" class="btn">Gizlilik Politikası Ve Çerez Aydınlatma Metni</a>
            <a href="https://www.sehlentur.com/kisisel-verilerin-korunmasi-kanunu/" class="btn">Kişisel Verilerin Korunması Kanunu Aydınlatma Metni</a>
        </div>
    `;
    document.body.appendChild(cookieConsent);

    document.querySelector(".btn-consent").addEventListener("click", function (e) {
        e.preventDefault();
        cookieConsent.style.display = "none";
    });
}
function handleSearchForm() {
    const oneWayTab = document.getElementById('one-way-tab');
    const roundTripTab = document.getElementById('round-trip-tab');
    const returnDateGroup = document.getElementById('return-date-group');
    const fromSelect = document.getElementById('departure_airport');
    const toSelect = document.getElementById('arrival_airport');
    const departureDateInput = document.getElementById('departure_time');
    const returnDateInput = document.getElementById('arrival_time');

    oneWayTab.addEventListener('click', function () {
        oneWayTab.classList.add('active');
        roundTripTab.classList.remove('active');
        returnDateGroup.style.display = 'none';
        returnDateInput.value = ""; // Dönüş tarihini temizle
        populateAllFlights(); 
    });

    roundTripTab.addEventListener('click', function () {
        roundTripTab.classList.add('active');
        oneWayTab.classList.remove('active');
        returnDateGroup.style.display = 'block';
        populateOutboundFlights(); 
    });

    returnDateGroup.style.display = 'none';

    let flightsData = [];

    fetch('/search_flights')
        .then(response => response.json())
        .then(data => {
            if (data.flights) {
                flightsData = data.flights;
                populateAllFlights();
            } else {
                console.error("Flights data is missing in the response");
            }
        })
        .catch(error => {
            console.error('Error fetching flights:', error);
        });

    function populateAllFlights() {
        const departureAirports = flightsData.map(flight => flight.departure_airport[1]);
        populateSelectOptions(fromSelect, departureAirports);
    }

    function populateOutboundFlights() {
        const outboundFlights = flightsData.filter(flight => flight.flight_direction === 'outbound');
        const departureAirports = outboundFlights.map(flight => flight.departure_airport[1]);
        populateSelectOptions(fromSelect, departureAirports);
    }

    fromSelect.addEventListener('change', function () {
        const selectedDeparture = fromSelect.value;
        const filteredFlights = flightsData.filter(flight => flight.departure_airport[1] === selectedDeparture);

        const arrivalAirports = filteredFlights.map(flight => flight.arrival_airport[1]);
        populateSelectOptions(toSelect, arrivalAirports);

        toSelect.addEventListener('change', function () {
            const selectedArrival = toSelect.value;
            const matchingFlights = filteredFlights.filter(flight => flight.arrival_airport[1] === selectedArrival);

            const availableDepartureDates = matchingFlights.map(flight => flight.date.split(' ')[0]);
            populateSelectOptions(departureDateInput, availableDepartureDates);

            if (availableDepartureDates.length > 0) {
                departureDateInput.value = availableDepartureDates[0];
            }

            if (roundTripTab.classList.contains('active')) {
                updateReturnDates(selectedDeparture, selectedArrival);
            }
        });
    });

    departureDateInput.addEventListener('change', function () {
        const selectedDeparture = fromSelect.value;
        const selectedArrival = toSelect.value;

        if (roundTripTab.classList.contains('active')) {
            updateReturnDates(selectedDeparture, selectedArrival);
        }
    });

    function updateReturnDates(selectedDeparture, selectedArrival) {
        const selectedDepartureDate = departureDateInput.value;

        const returnFlights = flightsData.filter(flight =>
            flight.flight_direction === 'return' &&
            flight.departure_airport[1] === selectedArrival && // Ters havalimanı
            flight.arrival_airport[1] === selectedDeparture && // Ters havalimanı
            flight.date.split(' ')[0] > selectedDepartureDate  // Gidiş tarihinden sonra olmalı
        );

        const availableReturnDates = returnFlights.map(flight => flight.date.split(' ')[0]);
        populateSelectOptions(returnDateInput, availableReturnDates); // Dönüş tarihlerini listele
    }
}

function populateSelectOptions(selectElement, options) {
    selectElement.innerHTML = '<option value="">Dönüş Tarihi</option>';
    const uniqueOptions = [...new Set(options)];
    uniqueOptions.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        selectElement.appendChild(option);
    });
}