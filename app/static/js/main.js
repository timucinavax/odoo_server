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
        e.preventDefault(); 

        const formData = new FormData(form);
        const formDataObject = {};
        formData.forEach((value, key) => formDataObject[key] = value);

        fetch('/flight-ticket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObject)
        })
        .then(response => {
            if (response.redirected) {
                window.location.href = '/flight-ticket';
            } else {
                return response.json(); 
            }
        })
        .then(data => {
            console.log('Success:', data); 
        })
        .catch(error => {
            console.error('Error:', error);
        });
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
    const returnDateInput = document.getElementById('return_time');

    let flightsData = [];

    oneWayTab.addEventListener('click', function () {
        oneWayTab.classList.add('active');
        roundTripTab.classList.remove('active');
        returnDateGroup.style.display = 'none';
    });

    roundTripTab.addEventListener('click', function () {
        roundTripTab.classList.add('active');
        oneWayTab.classList.remove('active');
        returnDateGroup.style.display = 'block';
    });

    fetch('/search_flights')
        .then(response => response.json())
        .then(data => {
            if (data.flights) {
                flightsData = data.flights;
                const departureAirports = [...new Set(data.flights.map(flight => `${flight.departure_airport[1]} - ${flight.departure_airport[0]}`))];
                populateSelectOptions(fromSelect, departureAirports);
            } else {
                console.error("Flights data is missing in the response");
            }
        })
        .catch(error => {
            console.error('Error fetching flights:', error);
        });

    fromSelect.addEventListener('change', function () {
        const selectedDepartureCode = fromSelect.value.split(' - ')[1];
        const filteredFlights = flightsData.filter(flight => flight.departure_airport[0] === selectedDepartureCode);

        const arrivalAirports = [...new Set(filteredFlights.map(flight => `${flight.arrival_airport[1]} - ${flight.arrival_airport[0]}`))];
        populateSelectOptions(toSelect, arrivalAirports);

        // Clear previous selections
        departureDateInput.innerHTML = '<option value="">Gidiş Tarihi</option>';
        returnDateInput.innerHTML = '<option value="">Dönüş Tarihi</option>';
    });

    toSelect.addEventListener('change', function () {
        const selectedDepartureCode = fromSelect.value.split(' - ')[1];
        const selectedArrivalCode = toSelect.value.split(' - ')[1];

        const matchingFlights = flightsData.filter(flight =>
            flight.departure_airport[0] === selectedDepartureCode &&
            flight.arrival_airport[0] === selectedArrivalCode
        );

        const availableDepartureDates = [...new Set(matchingFlights.map(flight => flight.date))];
        populateSelectOptions(departureDateInput, availableDepartureDates);

        // If round-trip is selected, handle return date
        if (roundTripTab.classList.contains('active')) {
            departureDateInput.addEventListener('change', function () {
                const selectedDepartureDate = departureDateInput.value;
                const returnFlights = matchingFlights.filter(flight => flight.date > selectedDepartureDate);

                const availableReturnDates = [...new Set(returnFlights.map(flight => flight.date))];
                populateSelectOptions(returnDateInput, availableReturnDates);
            });
        }
    });
}

function populateSelectOptions(selectElement, options) {
    selectElement.innerHTML = '<option value="">Seçiniz</option>';
    options.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        selectElement.appendChild(option);
    });
}