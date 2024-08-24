document.addEventListener("DOMContentLoaded", function () {
    createCookieConsent();
    loadCities();
    handleSearchForm();
});

function handleSearchForm() {
    const oneWayTab = document.getElementById('one-way-tab');
    const roundTripTab = document.getElementById('round-trip-tab');
    const returnDateGroup = document.getElementById('return-date-group');
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');
    const departureDateInput = document.getElementById('departure-date');

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

    returnDateGroup.style.display = 'none';

    fetch('/search_flights')
        .then(response => response.json())
        .then(data => {
            const departureAirports = [...new Set(data.map(flight => flight.departure_airport))];
            const arrivalAirports = [...new Set(data.map(flight => flight.arrival_airport))];
            const availableDates = [...new Set(data.map(flight => flight.departure_time.split(' ')[0]))];

            populateSelectOptions(fromSelect, departureAirports);
            populateSelectOptions(toSelect, arrivalAirports);
            restrictDateSelection(departureDateInput, availableDates);
        })
        .catch(error => {
            console.error('Error fetching flights:', error);
        });
}

function populateSelectOptions(selectElement, options) {
    options.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        selectElement.appendChild(option);
    });
}

function restrictDateSelection(dateInput, availableDates) {
    dateInput.addEventListener('input', function () {
        const selectedDate = dateInput.value;
        if (!availableDates.includes(selectedDate)) {
            dateInput.value = ''; // Seçilemezse, sıfırla
        }
    });

    dateInput.addEventListener('focus', function () {
        const minDate = availableDates[0];
        const maxDate = availableDates[availableDates.length - 1];
        dateInput.min = minDate;
        dateInput.max = maxDate;
    });
}
