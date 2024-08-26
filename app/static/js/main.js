document.addEventListener("DOMContentLoaded", function () {
    createCookieConsent();
    handleSearchForm();
});

function handleSearchForm() {
    const fromSelect = document.getElementById('departure_airport');
    const toSelect = document.getElementById('arrival_airport');
    const departureSelect = document.getElementById('departure_time');

    fromSelect.addEventListener('change', function () {
        fetch(`/get_arrival_airports?departure_airport=${fromSelect.value}`)
            .then(response => response.json())
            .then(data => {
                populateSelectOptions(toSelect, data.arrival_airports);
            });
    });

    toSelect.addEventListener('change', function () {
        fetch(`/get_available_dates?departure_airport=${fromSelect.value}&arrival_airport=${toSelect.value}`)
            .then(response => response.json())
            .then(data => {
                setupDateInput(departureSelect, data.available_dates);
            });
    });
}

function populateSelectOptions(selectElement, options) {
    selectElement.innerHTML = ''; // Mevcut seçenekleri temizle
    options.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        selectElement.appendChild(option);
    });
}

function setupDateInput(inputElement, availableDates) {
    inputElement.addEventListener('input', function () {
        const selectedDate = inputElement.value;
        if (!availableDates.includes(selectedDate)) {
            inputElement.value = '';  // Seçimi temizle
            alert('Bu tarih seçilemez. Lütfen geçerli bir tarih seçin.');
        }
    });
}
